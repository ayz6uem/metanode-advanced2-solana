import { Keypair, Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

(async()=>{
  const address = new PublicKey("CbRDuS5LmtEXP9WYx1Q92DbP5d3ZzWrKYNDNYhobxg14");
  console.log(`Public Key: ${address}`);

  const connection = new Connection("http://localhost:8899", "confirmed");

  // Funding an address with SOL automatically creates an account
  const signature = await connection.requestAirdrop(
    address,
    LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(signature, "confirmed");

  const accountInfo = await connection.getAccountInfo(address);
  console.log(JSON.stringify(accountInfo, null, 2));
})();
