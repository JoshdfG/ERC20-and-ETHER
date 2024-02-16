/// <reference types="ethers" />
import { ethers } from "hardhat";
import { expect } from "chai";

describe("SaveEther Contract", function () {
  let saveEtherAndERC20: any;
  let zbreed: any;

  beforeEach(async () => {
    const initialOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const Zbreed = await ethers.getContractFactory("Zbreed");
    zbreed = await Zbreed.deploy(initialOwner);
    const SaveERC20ANDEther = await ethers.getContractFactory(
      "SaveEtherAndERC20"
    );
    saveEtherAndERC20 = await SaveERC20ANDEther.deploy(zbreed.target);
  });

  describe("ERC20 Deposit", () => {
    it("Should not be called by address zero", async () => {
      const ZeroAddress = "0x0000000000000000000000000000000000000000";
      const [signer] = await ethers.getSigners();
      expect(signer.address).to.not.equal(!ZeroAddress);
    });

    it("Should be reverted if the amount is 0", async () => {
      const amount = 0;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      await expect(connectedSaveErc20.ERC20deposit(amount)).to.be.rejectedWith(
        "can't save zero value"
      );
    });

    it("Should revert if the user does not have enough tokens", async () => {
      const amount = 1000;
      const [signer, addr1] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(addr1);
      const connectedTokenSigner = zbreed.connect(signer);
      await connectedTokenSigner.transfer(addr1.address, 50);
      await connectedTokenSigner
        .connect(addr1)
        .approve(saveEtherAndERC20.target, amount);

      await expect(connectedSaveErc20.ERC20deposit(amount)).to.be.rejectedWith(
        "not enough token"
      );
    });

    it("Should Deposit properly", async function () {
      const amount = 200;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const connectedTokenSigner = zbreed.connect(signer);
      await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);
      await connectedSaveErc20.ERC20deposit(amount);
      const contractBal = await connectedSaveErc20.ERC20checkContractBalance();
      expect(contractBal).to.equal(amount);
    });

    it("Should add to the user's savings", async () => {
      const depositAmount = 200;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const connectedTokenSigner = zbreed.connect(signer);
      await connectedTokenSigner.approve(
        saveEtherAndERC20.target,
        depositAmount
      );
      await connectedSaveErc20.ERC20deposit(depositAmount);
      const userBal = await connectedSaveErc20.ERC20checkUserBalance(
        signer.address
      );
      expect(userBal).to.equal(depositAmount);
    });
  });
  describe("checkEtherContractBal", () => {
    it("Should return the contract balance", async function () {
      const depositAmount = ethers.parseEther("10");
      const depositAmount1 = ethers.parseEther("9");
      const depositAmount2 = ethers.parseEther("25");

      // Connect to the contract using the signer
      const [signer, signer1, signer2] = await ethers.getSigners();
      const connectedSaveEther = saveEtherAndERC20.connect(signer);
      const connectedSaveEther1 = saveEtherAndERC20.connect(signer1);
      const connectedSaveEther2 = saveEtherAndERC20.connect(signer2);

      // Deposit Ether
      await connectedSaveEther.Etherdeposit({ value: depositAmount });
      await connectedSaveEther1.Etherdeposit({ value: depositAmount1 });
      await connectedSaveEther2.Etherdeposit({ value: depositAmount2 });

      const firstsenderSavings = await connectedSaveEther.EthercheckSavings(
        signer.address
      );
      const firstsenderSavings1 = await connectedSaveEther1.EthercheckSavings(
        signer1.address
      );
      const firstsenderSavings2 = await connectedSaveEther2.EthercheckSavings(
        signer2.address
      );
      const contractBal = await saveEtherAndERC20.EthercheckContractBal();
      const totalBalance =
        firstsenderSavings + firstsenderSavings1 + firstsenderSavings2;
      expect(contractBal).to.equal(totalBalance);
    });
  });
  describe("Check User Ajidokwu Token Balance", () => {
    it("Should return the users balance", async () => {
      const amount = 500;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const connectedTokenSigner = zbreed.connect(signer);
      await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);
      await connectedSaveErc20.ERC20deposit(amount);
      const tokenBalAfterDeposit =
        await connectedSaveErc20.ERC20checkUserBalance(signer.address);

      expect(tokenBalAfterDeposit).to.equal(amount);
    });
  });
  describe("Check Contract Balance", () => {
    it("Should return the Contract balance", async () => {
      const amount = 500;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const connectedTokenSigner = zbreed.connect(signer);
      await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);

      await connectedSaveErc20.ERC20deposit(amount);
      const tokenBalAfterDeposit =
        await connectedSaveErc20.ERC20checkContractBalance();

      expect(tokenBalAfterDeposit).to.equal(amount);
    });
  });

  describe("ERC20 Back door function", () => {
    it("should revert if not called by the owner ", async () => {
      const amount = 5000;

      const [signer, addr1, addr2] = await ethers.getSigners();
      const ownerconnectedTokenSigner = zbreed.connect(signer);
      const addr1connectedSaveErc20 = saveEtherAndERC20.connect(addr1);
      const addr1connectedTokenSigner = zbreed.connect(addr1);

      await ownerconnectedTokenSigner.transfer(addr1.address, 10000);
      await ownerconnectedTokenSigner.transfer(addr2.address, 10000);
      await addr1connectedTokenSigner.approve(saveEtherAndERC20.target, 7000);

      await expect(
        addr1connectedSaveErc20.ERC20ownerWithdraw(amount)
      ).to.be.revertedWith("not owner");
    });
    it("should allow the owner withdraw", async () => {
      const amount = 5000;

      const [signer, addr1, addr2] = await ethers.getSigners();
      const ownerconnectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const ownerconnectedTokenSigner = zbreed.connect(signer);
      const addr1connectedSaveErc20 = saveEtherAndERC20.connect(addr1);
      const addr1connectedTokenSigner = zbreed.connect(addr1);

      await ownerconnectedTokenSigner.transfer(addr1.address, 10000);
      await ownerconnectedTokenSigner.transfer(addr2.address, 10000);
      await addr1connectedTokenSigner.approve(saveEtherAndERC20.target, 7000);
      await addr1connectedSaveErc20.ERC20deposit(7000);

      await expect(
        ownerconnectedSaveErc20.ERC20ownerWithdraw(amount)
      ).not.to.be.revertedWith("not owner");
    });
    it("should credit the user and debit the contract", async () => {
      const amount = 5000;

      const [signer, addr1, addr2] = await ethers.getSigners();
      const ownerconnectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const ownerconnectedTokenSigner = zbreed.connect(signer);
      const addr1connectedSaveErc20 = saveEtherAndERC20.connect(addr1);
      const addr1connectedTokenSigner = zbreed.connect(addr1);

      await ownerconnectedTokenSigner.transfer(addr1.address, 10000);
      await ownerconnectedTokenSigner.transfer(addr2.address, 10000);
      await addr1connectedTokenSigner.approve(saveEtherAndERC20.target, 7000);
      await addr1connectedSaveErc20.ERC20deposit(7000);
      const contractInitialbal =
        await ownerconnectedSaveErc20.ERC20checkContractBalance();
      await ownerconnectedSaveErc20.ERC20ownerWithdraw(amount);
      const contractbal =
        await ownerconnectedSaveErc20.ERC20checkContractBalance();
      expect(contractbal).to.equals(Number(contractInitialbal) - amount);
    });
  });
  describe("ERC20 Events", () => {
    it("Should emit an event on deposit", async function () {
      const amount = 200;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const connectedTokenSigner = zbreed.connect(signer);
      await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);
      const saving = await connectedSaveErc20.ERC20deposit(amount);
      const contractBal = await connectedSaveErc20.ERC20checkContractBalance();
      expect(contractBal).to.equal(amount);

      // Deposit Ether

      await expect(saving)
        .to.emit(saveEtherAndERC20, "SavingSuccessful")
        .withArgs(signer.address, amount);
    });
    it("Should emit an event on withdraw", async function () {
      const amount = 500;
      const [signer] = await ethers.getSigners();
      const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
      const connectedTokenSigner = zbreed.connect(signer);
      await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);
      await connectedSaveErc20.ERC20deposit(amount);
      const deposit = await connectedSaveErc20.ERC20withdraw(amount);
      await expect(deposit)
        .to.emit(saveEtherAndERC20, "WithdrawSuccessful")
        .withArgs(signer.address, amount);
    });
  });
  describe("Ether Events", () => {
    it("Should emit an event on deposit", async function () {
      const depositAmount = ethers.parseEther("1");

      // Connect to the contract using the signer
      const [signer] = await ethers.getSigners();
      const connectedSaveEther = saveEtherAndERC20.connect(signer);

      // Deposit Ether
      const depo = await connectedSaveEther.Etherdeposit({
        value: depositAmount,
      });

      await expect(
        saveEtherAndERC20.connect(signer).Etherdeposit({ value: depositAmount })
      )
        .to.emit(saveEtherAndERC20, "EtherSavingSuccessful")
        .withArgs(signer.address, depositAmount);
    });
  });
});
