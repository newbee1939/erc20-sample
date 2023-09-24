import { ethers } from "ethers";
import erc20Artifact from "../artifacts/contracts/ERC20.sol/ERC20.json";
import { program, Option } from "commander";
import * as dotenv from "dotenv";
dotenv.config();

// Ethereumネットワーク上にスマートコントラクト（HelloWorld）をデプロイする
async function main(name: string, symbol: string, decimals: number) {
  const privateKey: string = process.env.PRIVATE_KEY ?? "";
  if (privateKey === "") {
    throw new Error("No Value Set for environment variable PRIVATE_KEY");
  }

  // Ethereumネットワークへの接続点
  const rpcUrl: string = process.env.SEPOLIA_URL ?? "";
  if (rpcUrl === "") {
    throw new Error("No Value Set for environment variable SEPOLIA_URL");
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);
  const factory = new ethers.ContractFactory(
    erc20Artifact.abi, // スマートコントラクトのABI（Application Binary Interface）
    erc20Artifact.bytecode, // コンパイル済みのスマートコントラクト
    signer
  );

  // スマートコントラクトをテスト用ネットワークにデプロイ
  const contract = await factory.deploy(name, symbol, decimals); // トランザクションが送られるのを待つ
  console.log(`ERC20 contract deploy address ${contract.address}`); // スマートコントラクトのアドレス
  console.log(
    `Transaction URL: https://sepolia.etherscan.io/tx/${contract.deployTransaction.hash}`
  );

  await contract.deployed(); // トランザクションが実行される(ブロックに取り込まれる)のを待つ
  console.log("Deploy completed");
}

program
  .addOption(
    new Option(
      "--name <strong>",
      "name of toke (e.g. bitcoin)"
    ).makeOptionMandatory()
  )
  .addOption(
    new Option(
      "--symbol <strong>",
      "symbol of toke (e.g. bitcoin)"
    ).makeOptionMandatory()
  )
  .addOption(
    new Option("--decimals <number>", "decimals of toke (e.g. 18)")
      .argParser(parseInt)
      .makeOptionMandatory()
  )
  .parse();

const options = program.opts();

// npx ts-node scripts/deploy.ts --name Zenny --symbol ZNY --decimals 18 としたらoptionsに値を渡せる

main(options.name, options.symbol, options.decimals).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
