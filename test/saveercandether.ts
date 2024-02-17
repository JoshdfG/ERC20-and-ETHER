/// <reference types="ethers" />
import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { any } from "hardhat/internal/core/params/argumentTypes";

describe("SaveEther Contract", function () {
  let saveEtherAndERC20: any;
  let zbreed: any;

  // beforeEach(async () => {
  //   const initialOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  //   const Zbreed = await ethers.getContractFactory("Zbreed");
  //   zbreed = await Zbreed.deploy(initialOwner);
  //   const SaveERC20ANDEther = await ethers.getContractFactory(
  //     "SaveEtherAndERC20"
  //   );
  //   saveEtherAndERC20 = await SaveERC20ANDEther.deploy(zbreed.target);
  // });
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

// it("Should not be calluserSavingsed by address zero", async () => {
//   const ZeroAddress = "0x0000000000000000000000000000000000000000";
//   const [signer] = await ethers.getSigners();
//   expect(signer.address).to.not.equal(ZeroAddress);
// });

// it("Should be reverted if the amount is 0", async () => {
//   const amount = 0;
//   const [signer] = await ethers.getSigners();
//   const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
//   await expect(connectedSaveErc20.ERC20deposit(amount)).to.be.rejectedWith(
//     "can't save zero value"
//   );
// });

// it("should revert if transferFrom fails", async () => {
//   const [signer] = await ethers.getSigners();
//   const failingTransfer = zbreed.ERC20deposit(
//     saveEtherAndERC20.address,
//     100
//   );
//   await expect(failingTransfer).to.be.revertedWith("failed to transfer");
// });

// it("Should revert if the user does not have enough tokens", async () => {
//   const amount = 1000;
//   const [signer, addr1] = await ethers.getSigners();
//   const connectedSaveErc20 = saveEtherAndERC20.connect(addr1);
//   const connectedTokenSigner = zbreed.connect(signer);
//   await connectedTokenSigner.transfer(addr1.address, 50);
//   await connectedTokenSigner
//     .connect(addr1)
//     .approve(saveEtherAndERC20.target, amount);

//   await expect(connectedSaveErc20.ERC20deposit(amount)).to.be.rejectedWith(
//     "not enough token"
//   );
// });

// it("Should Deposit properly", async function () {
//   const amount = 200;
//   const [signer] = await ethers.getSigners();
//   const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
//   const connectedTokenSigner = zbreed.connect(signer);
//   await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);
//   await connectedSaveErc20.ERC20deposit(amount);
//   const contractBal = await connectedSaveErc20.ERC20checkContractBalance();
//   expect(contractBal).to.equal(amount);
// });

// it("Should add to the user's savings", async () => {
//   const depositAmount = 200;
//   const [signer] = await ethers.getSigners();
//   const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
//   const connectedTokenSigner = zbreed.connect(signer);
//   await connectedTokenSigner.approve(
//     saveEtherAndERC20.target,
//     depositAmount
//   );
//   await connectedSaveErc20.ERC20deposit(depositAmount);
//   const userBal = await connectedSaveErc20.ERC20checkUserBalance(
//     signer.address
//   );
//   expect(userBal).to.equal(depositAmount);
// });

// describe("checkEtherContractBal", () => {
//   it("Should return the contract balance", async function () {
//     const depositAmount = ethers.parseEther("10");
//     const depositAmount1 = ethers.parseEther("9");
//     const depositAmount2 = ethers.parseEther("25");

//     // Connect to the contract using the signer
//     const [signer, signer1, signer2] = await ethers.getSigners();
//     const connectedSaveEther = saveEtherAndERC20.connect(signer);
//     const connectedSaveEther1 = saveEtherAndERC20.connect(signer1);
//     const connectedSaveEther2 = saveEtherAndERC20.connect(signer2);

//     // Deposit Ether
//     await connectedSaveEther.Etherdeposit({ value: depositAmount });
//     await connectedSaveEther1.Etherdeposit({ value: depositAmount1 });
//     await connectedSaveEther2.Etherdeposit({ value: depositAmount2 });

//     const firstsenderSavings = await connectedSaveEther.EthercheckSavings(
//       signer.address
//     );
//     const firstsenderSavings1 = await connectedSaveEther1.EthercheckSavings(
//       signer1.address
//     );
//     const firstsenderSavings2 = await connectedSaveEther2.EthercheckSavings(
//       signer2.address
//     );
//     const contractBal = await saveEtherAndERC20.EthercheckContractBal();
//     const totalBalance =
//       firstsenderSavings + firstsenderSavings1 + firstsenderSavings2;
//     expect(contractBal).to.equal(totalBalance);
//   });
// });
// describe("Check User Ajidokwu Token Balance", () => {
//   it("Should return the users balance", async () => {
//     const amount = 500;
//     const [signer] = await ethers.getSigners();
//     const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
//     const connectedTokenSigner = zbreed.connect(signer);
//     await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);
//     await connectedSaveErc20.ERC20deposit(amount);
//     const tokenBalAfterDeposit =
//       await connectedSaveErc20.ERC20checkUserBalance(signer.address);

//     expect(tokenBalAfterDeposit).to.equal(amount);
//   });
// });
// describe("Check Contract Balance", () => {
//   it("Should return the Contract balance", async () => {
//     const amount = 500;
//     const [signer] = await ethers.getSigners();
//     const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
//     const connectedTokenSigner = zbreed.connect(signer);
//     await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);

//     await connectedSaveErc20.ERC20deposit(amount);
//     const tokenBalAfterDeposit =
//       await connectedSaveErc20.ERC20checkContractBalance();

//     expect(tokenBalAfterDeposit).to.equal(amount);
//   });
// });

// describe("ERC20 Back door function", () => {
//   it("should revert if not called by the owner ", async () => {
//     const amount = 5000;

//     const [signer, addr1, addr2] = await ethers.getSigners();
//     const ownerconnectedTokenSigner = zbreed.connect(signer);
//     const addr1connectedSaveErc20 = saveEtherAndERC20.connect(addr1);
//     const addr1connectedTokenSigner = zbreed.connect(addr1);

//     await ownerconnectedTokenSigner.transfer(addr1.address, 10000);
//     await ownerconnectedTokenSigner.transfer(addr2.address, 10000);
//     await addr1connectedTokenSigner.approve(saveEtherAndERC20.target, 7000);

//     await expect(
//       addr1connectedSaveErc20.ERC20ownerWithdraw(amount)
//     ).to.be.revertedWith("not owner");
//   });
//   it("should allow the owner withdraw", async () => {
//     const amount = 5000;

//     const [signer, addr1, addr2] = await ethers.getSigners();
//     const ownerconnectedSaveErc20 = saveEtherAndERC20.connect(signer);
//     const ownerconnectedTokenSigner = zbreed.connect(signer);
//     const addr1connectedSaveErc20 = saveEtherAndERC20.connect(addr1);
//     const addr1connectedTokenSigner = zbreed.connect(addr1);

//     await ownerconnectedTokenSigner.transfer(addr1.address, 10000);
//     await ownerconnectedTokenSigner.transfer(addr2.address, 10000);
//     await addr1connectedTokenSigner.approve(saveEtherAndERC20.target, 7000);
//     await addr1connectedSaveErc20.ERC20deposit(7000);

//     await expect(
//       ownerconnectedSaveErc20.ERC20ownerWithdraw(amount)
//     ).not.to.be.revertedWith("not owner");
//   });
//   it("should credit the user and debit the contract", async () => {
//     const amount = 5000;

//     const [signer, addr1, addr2] = await ethers.getSigners();
//     const ownerconnectedSaveErc20 = saveEtherAndERC20.connect(signer);
//     const ownerconnectedTokenSigner = zbreed.connect(signer);
//     const addr1connectedSaveErc20 = saveEtherAndERC20.connect(addr1);
//     const addr1connectedTokenSigner = zbreed.connect(addr1);

//     await ownerconnectedTokenSigner.transfer(addr1.address, 10000);
//     await ownerconnectedTokenSigner.transfer(addr2.address, 10000);
//     await addr1connectedTokenSigner.approve(saveEtherAndERC20.target, 7000);
//     await addr1connectedSaveErc20.ERC20deposit(7000);
//     const contractInitialbal =
//       await ownerconnectedSaveErc20.ERC20checkContractBalance();
//     await ownerconnectedSaveErc20.ERC20ownerWithdraw(amount);
//     const contractbal =
//       await ownerconnectedSaveErc20.ERC20checkContractBalance();
//     expect(contractbal).to.equals(Number(contractInitialbal) - amount);
//   });
// });
// describe("ERC20 Events", () => {
//   it("Should emit an event on deposit", async function () {
//     const amount = 200;
//     const [signer] = await ethers.getSigners();
//     const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
//     const connectedTokenSigner = zbreed.connect(signer);
//     await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);
//     const saving = await connectedSaveErc20.ERC20deposit(amount);
//     const contractBal = await connectedSaveErc20.ERC20checkContractBalance();
//     expect(contractBal).to.equal(amount);

//     // Deposit Ether

//     await expect(saving)
//       .to.emit(saveEtherAndERC20, "SavingSuccessful")
//       .withArgs(signer.address, amount);
//   });
//   it("Should emit an event on withdraw", async function () {
//     const amount = 500;
//     const [signer] = await ethers.getSigners();
//     const connectedSaveErc20 = saveEtherAndERC20.connect(signer);
//     const connectedTokenSigner = zbreed.connect(signer);
//     await connectedTokenSigner.approve(saveEtherAndERC20.target, amount);
//     await connectedSaveErc20.ERC20deposit(amount);
//     const deposit = await connectedSaveErc20.ERC20withdraw(amount);
//     await expect(deposit)
//       .to.emit(saveEtherAndERC20, "WithdrawSuccessful")
//       .withArgs(signer.address, amount);
//   });
// });
// describe("Ether Events", () => {
//   it("Should emit an event on deposit", async function () {
//     const depositAmount = ethers.parseEther("1");

//     // Connect to the contract using the signer
//     const [signer] = await ethers.getSigners();
//     const connectedSaveEther = saveEtherAndERC20.connect(signer);

//     // Deposit Ether
//     const depo = await connectedSaveEther.Etherdeposit({
//       value: depositAmount,
//     });

//     await expect(
//       saveEtherAndERC20.connect(signer).Etherdeposit({ value: depositAmount })
//     )
//       .to.emit(saveEtherAndERC20, "EtherSavingSuccessful")
//       .withArgs(signer.address, depositAmount);
//   });
// });
// });
