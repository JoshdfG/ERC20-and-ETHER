/// <reference types="ethers" />
import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { any } from "hardhat/internal/core/params/argumentTypes";

describe("SaveEther Contract", function () {
  let saveEtherAndERC20: any;
  let zbreed: any;

  async function deployEtherAndERC20() {
    const [account1, account2] = await ethers.getSigners();

    const Zbreed = await ethers.getContractFactory("Zbreed");
    zbreed = await Zbreed.deploy(account1.address);

    const SaveERC20ANDEther = await ethers.getContractFactory(
      "SaveEtherAndERC20"
    );
    saveEtherAndERC20 = await SaveERC20ANDEther.deploy(zbreed.target);
    const amuntToDepost = 100;

    return { zbreed, saveEtherAndERC20, account1, account2, amuntToDepost };
  }

  describe("ERC20 Deposit", () => {
    it("should deposit successfully", async () => {
      const { zbreed, saveEtherAndERC20, account1, amuntToDepost } =
        await loadFixture(deployEtherAndERC20);

      await zbreed.approve(saveEtherAndERC20.target, 1000);
      await saveEtherAndERC20.ERC20deposit(amuntToDepost);

      const balance = await saveEtherAndERC20.ERC20checkUserBalance(
        account1.address
      );
      expect(balance).to.equal(amuntToDepost);
    });
  });

  it("should not allow zero deposit", async () => {
    const { zbreed, saveEtherAndERC20, account1 } = await loadFixture(
      deployEtherAndERC20
    );

    await expect(saveEtherAndERC20.ERC20deposit(0)).to.be.revertedWith(
      "can't save zero value"
    );
  });

  it("should not be called by a zero account", async () => {
    const zero = "0x0000000000000000000000000000000000000000";
    const account1 = ethers.getSigners();
    expect(account1).to.not.equal(zero);
  });

  it("should have balance", async () => {
    const { amuntToDepost } = await loadFixture(deployEtherAndERC20);

    const deposit = 50;
    expect(deposit).to.not.equal(amuntToDepost);
  });
  it("should be reverted if transfer from fails", async () => {
    const failingTransfer = saveEtherAndERC20.ERC20deposit(
      saveEtherAndERC20.address,
      100
    );
    expect(failingTransfer).to.be.revertedWith("failed to transfer");
  });

  describe("EthercheckContractBal", () => {
    it("should check the contract balance", async () => {
      const contractBalance = await saveEtherAndERC20.EthercheckContractBal();
      expect(contractBalance).to.be.equal(0);
    });
  });

  describe("Ether check Savings", () => {
    it("should check ether savings", async () => {
      const { saveEtherAndERC20, account1 } = await loadFixture(
        deployEtherAndERC20
      );
      expect(
        await saveEtherAndERC20.EthercheckSavings(account1.address)
      ).to.be.equal(0);
    });
  });
  describe("Ethers Withdraw", () => {
    it("should not withdraw to a zero account", async () => {
      const zero = "0x0000000000000000000000000000000000000000";
      const account = ethers.getSigners();
      expect(account).to.not.equal(zero);
    });

    it("should be greater than zero", () => {
      const amount = 0;
      const savings = ethers.getSigners();
      expect(savings).to.not.equal(amount);
    });

    it("should be equal to the user savings", async () => {
      const { saveEtherAndERC20 } = await loadFixture(deployEtherAndERC20);
      const userSavings = saveEtherAndERC20.Etherwithdraw();
      await expect(userSavings).to.be.revertedWith(
        "you don't have any savings"
      );
    });
  });

  describe("EthersendOutSaving", () => {
    it("Should not send to address zero", async () => {
      const xero = "0x0000000000000000000000000000000000000000";
      const acc = ethers.getSigners();
      expect(acc).to.not.equal(xero);
    });

    it("should be greater than zero", async () => {
      const amount = 0;
      const savings = ethers.getSigners();
      expect(savings).to.not.equal(amount);
    });

    it("Should be greater than or equal to the amount saved", async () => {
      const { saveEtherAndERC20, account1 } = await loadFixture(
        deployEtherAndERC20
      );
      const amount = 100;
      const etherSavings = saveEtherAndERC20.EthersendOutSaving(
        account1.address,
        amount
      );
      expect(etherSavings).to.be.revertedWith(
        "you do not have sufficient balance"
      );
    });
  });

  describe("ERC20ownerWithdraw", async () => {
    it("should withdraw ERC20 tokens owned by the owner", async () => {
      const { zbreed, saveEtherAndERC20, account1 } = await loadFixture(
        deployEtherAndERC20
      );
      await zbreed.approve(saveEtherAndERC20.target, 1000);
      await saveEtherAndERC20.ERC20deposit(1000);
      await saveEtherAndERC20.ERC20ownerWithdraw(1000);
      const balance = await saveEtherAndERC20.ERC20checkUserBalance(
        account1.address
      );
      expect(balance).to.equal(1000);
    });
    it("should not withdraw ERC20 tokens not owned by the owner", async () => {
      const { zbreed, saveEtherAndERC20, account1, account2 } =
        await loadFixture(deployEtherAndERC20);
      await zbreed.approve(saveEtherAndERC20.target, 1000);
      await saveEtherAndERC20.ERC20deposit(1000);
      await saveEtherAndERC20.ERC20ownerWithdraw(1000);
      const balance = await saveEtherAndERC20.ERC20checkUserBalance(
        account1.address
      );
      expect(balance).to.equal(1000);
    });
  });

  describe("ERC20checkUserBalance", async () => {
    it("should check user balance", async () => {
      const { zbreed, saveEtherAndERC20, account1 } = await loadFixture(
        deployEtherAndERC20
      );
      await zbreed.approve(saveEtherAndERC20.target, 1000);
      await saveEtherAndERC20.ERC20deposit(1000);
      const balance = await saveEtherAndERC20.ERC20checkUserBalance(
        account1.address
      );
      expect(balance).to.equal(1000);
    });
  });
  describe("EthercheckContractBal", async () => {
    it("should check the contract balance", async () => {
      const { zbreed, saveEtherAndERC20, account1 } = await loadFixture(
        deployEtherAndERC20
      );
      await zbreed.approve(saveEtherAndERC20.target, 1000);
      await saveEtherAndERC20.ERC20deposit(1000);
      const contractBalance = await saveEtherAndERC20.EthercheckContractBal();
      expect(contractBalance).to.equal(0);
    });
  });
  describe("Etherdeposit", async () => {
    it("Should not send ether to address zero", async () => {
      const xero = "0x0000000000000000000000000000000000000000";
      const acc = ethers.getSigners();
      expect(acc).to.not.equal(xero);
    });
    it("Should be greater than zero", async () => {
      const amount = 0;
      const savings = ethers.getSigners();
      expect(savings).to.not.equal(amount);
    });
    it("Should deposit ether", async () => {
      const { saveEtherAndERC20, account1 } = await loadFixture(
        deployEtherAndERC20
      );
      const balance = await saveEtherAndERC20.EthercheckSavings(
        account1.address
      );
      expect(balance).to.equal(0);
    });
  });
});
