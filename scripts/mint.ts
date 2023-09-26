import { ethers } from "ethers";
import erc20Artifact from "../artifacts/contracts/ERC20.sol/ERC20.json";
import { program, Option } from "commander";
import * as dotenv from "dotenv";
dotenv.config();

function getRpcUrl(network: string): string {
  if (network === "polygon") {
    return process.env.POLYGON_URL ?? "";
  } else if (network === "sepolia") {
    return process.env.SEPOLIA_URL ?? "";
  } else {
    return "";
  }
}

function transactionExplorerUrl(network: string, txHash: string): string {
  if (network === "polygon") {
    return `https://polygonscan.com/tx/${txHash}`;
  } else if (network === "sepolia") {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  } else {
    return "";
  }
}

async function main(
  network: string,
  contractAddress: string,
  accountAddress: string,
  amount: number
) {
  const privateKey: string = process.env.PRIVATE_KEY ?? "";
  if (privateKey === "") {
    throw new Error("No Value Set for environment variable PRIVATE_KEY");
  }

  // Ethereumネットワークへの接続点(Sepolia)
  const rpcUrl: string = getRpcUrl(network);
  if (rpcUrl === "") {
    throw new Error("No Value Set for environment variable SEPOLIA_URL");
  }

  // mintしていく
  const provider = new ethers.providers.JsonRpcBatchProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider); // metamaskのwalletみたいなイメージ

  const contract = new ethers.Contract(
    contractAddress,
    erc20Artifact.abi,
    signer
  );
  const decimals: number = await contract.decimals();
  const rawAmount: bigint = BigInt(Math.floor(amount * 10 ** decimals));
  const tx = await contract.mint(accountAddress, rawAmount);

  console.log(`Tansaction URL: ${transactionExplorerUrl(network, tx.hash)}`);

  const receipt = await tx.wait();
  console.log("completed");
  for (let log of receipt.logs) {
    try {
      const event = contract.interface.parseLog(log);
      console.log(`Event Name: ${event["name"]}`);
      console.log(`Args: ${event["args"]}`);
    } catch (e) {}
}

program
  .addOption(
    new Option(
      "--network <string>",
      "name of blockchain network (e.g. polygon, sepolia)"
    )
      .choices(["polygon", "sepolia"])
      .makeOptionMandatory()
  )
  .addOption(
    new Option(
      "--contractAddress <address>",
      "address of token contract"
    ).makeOptionMandatory()
  )
  .addOption(
    new Option(
      "--accountAddress <address>",
      "mint token to this account address"
    ).makeOptionMandatory()
  )
  .addOption(
    new Option("--amount <number>", "amount of token minted (ex. 1.23)")
      .argParser(parseFloat)
      .makeOptionMandatory()
  )
  .parse();

const options = program.opts();

main(
  options.network,
  options.contractAddress,
  options.accountAddress,
  options.amount
).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// npx ts-node scripts/mint.ts --network sepolia --contractAddress 0xbd953fc91c02aacbd5bc9f57264764ad4c8a8d37 --accountAddress 0x9Cc14C10e924B1Be0bc68bf54efc1E0B5FBC3d80 --amount 1.23
