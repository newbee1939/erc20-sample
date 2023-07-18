import { expect } from "chai";
import { ethers } from "hardhat";

describe("ERC20 contract states", () => {
  it("getters", async () => {
    const ERC20 = await ethers.getContractFactory("ERC20");
    // 1234 decimal => 1.234
    const erc20 = await ERC20.deploy("Zenny", "ZNY", 18);
    await erc20.deployed();

    expect(await erc20.name()).to.equal("Zenny");
    expect(await erc20.symbol()).to.equal("ZNY");
    expect(await erc20.decimals()).to.equal(18);
    expect(await erc20.totalSupply()).to.equal(0);
  });

  it("owner is account0", async () => {
    // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    const [account0] = await ethers.getSigners();
    const ERC20 = await ethers.getContractFactory("ERC20");
    const erc20 = await ERC20.deploy("Zenny", "ZNY", 18);
    await erc20.deployed();

    expect(account0.address).to.equal(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    );
    // _ownerに値がセットされる
    expect(await erc20._owner()).to.equal(account0.address);
    expect(await erc20._owner()).to.equal(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    );
  });

  it("owner is account1", async () => {
    const [account0, account1] = await ethers.getSigners();
    // デフォルトだとアカウント0が入るが、引数に自分で指定することも可能
    const ERC20 = await ethers.getContractFactory("ERC20", account1);
    const erc20 = await ERC20.deploy("Zenny", "ZNY", 18);
    await erc20.deployed();

    expect(account1.address).to.equal(
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    );
    expect(await erc20._owner()).to.equal(account1.address);
    expect(await erc20._owner()).to.equal(
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    );
  });
});
