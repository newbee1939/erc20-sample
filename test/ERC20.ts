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
});
