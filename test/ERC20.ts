import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

async function deployContractFixture() {
  // サインするアカウントを取得
  // ethers.getSigners()は、テストや開発のために使用されるローカルイーサリアムアカウント（または署名者）を取得するためのメソッド
  const [account0, account1, account2] = await ethers.getSigners();
  // コントラクトファクトリを取得します。これにより、指定した名前のスマートコントラクトを作成することができる
  const ERC20 = await ethers.getContractFactory("ERC20", account0);
  // 1234 decimal => 1.234
  const erc20 = await ERC20.deploy("Zenny", "ZNY", 18);
  // スマートコントラクトのデプロイが完了するまで待つ
  await erc20.deployed();
  return { erc20, account0, account1, account2 };
}

describe("ERC20 contract states", () => {
  it("getters", async () => {
    // テストフィクスチャ（テストの前提条件）を読み込む
    const { erc20 } = await loadFixture(deployContractFixture);

    expect(await erc20.name()).to.equal("Zenny");
    expect(await erc20.symbol()).to.equal("ZNY");
    expect(await erc20.decimals()).to.equal(18);
    expect(await erc20.totalSupply()).to.equal(0);
  });
});

describe("ERC20 mint", function () {
  it("mint", async () => {
    const { erc20, account0, account1, account2 } = await loadFixture(
      deployContractFixture
    );

    expect(await erc20.balanceOf(account0.address)).to.equal(0);
    expect(await erc20.balanceOf(account1.address)).to.equal(0);
    expect(await erc20.balanceOf(account2.address)).to.equal(0);

    const decimals: number = await erc20.decimals();
    // decimals=3 0.001 => 1, 0.001 * (10 ** 3)
    const amount1: bigint = 10n * 10n ** BigInt(decimals);

    const txt1 = await erc20.mint(account1.address, amount1);
    // トランザクションが終わるのを待つ
    const receipt1 = await txt1.wait();

    expect(await erc20.balanceOf(account0.address)).to.equal(0);
    expect(await erc20.balanceOf(account1.address)).to.equal(amount1);
    expect(await erc20.balanceOf(account2.address)).to.equal(0);
    expect(await erc20.totalSupply()).to.equal(amount1);

    const amount2: bigint = 20n * 10n ** BigInt(decimals);

    // トランザクションの送信をしただけ
    const txt2 = await erc20.mint(account1.address, amount2);
    // トランザクションが終わるのを待つ
    const receipt2 = await txt1.wait();

    expect(await erc20.balanceOf(account0.address)).to.equal(0);
    expect(await erc20.balanceOf(account1.address)).to.equal(amount1 + amount2);
    expect(await erc20.balanceOf(account2.address)).to.equal(0);
    expect(await erc20.totalSupply()).to.equal(amount1 + amount2);
  });

  it("mint from non-owner", async () => {
    const { erc20, account0, account1, account2 } = await loadFixture(
      deployContractFixture
    );

    const amount = 123;

    // 自分のアカウントに自分でトークンを入れようとする
    await expect(
      erc20.connect(account1).mint(account1.address, amount)
    ).revertedWith("only contract owner can call mint");
    expect(await erc20.balanceOf(account1.address)).to.equal(0);
  });

  it("mint overflow", async () => {
    const { erc20, account0, account1, account2 } = await loadFixture(
      deployContractFixture
    );
    const uint256Max: bigint = 2n ** 256n - 1n;

    await erc20.mint(account1.address, uint256Max);
    await expect(erc20.mint(account1.address, 1)).to.be.revertedWithPanic(0x11);
  });
});
