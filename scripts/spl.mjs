import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { createMint, createAssociatedTokenAccount, mintTo, transfer, getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import fs from "fs";

const mintPubkey = new PublicKey("BTMDanLkfcrT523H37b2iYin9V8eGtHvjpFpEvjBNogc");
const associatedTokenAccount = new PublicKey("39SrhSxg3bxBtiLH853Du1G4MMepKYFoKwVNZh2YW3jb");

// Create connection to local validator
const connection = new Connection("http://localhost:8899", "confirmed");
const latestBlockhash = await connection.getLatestBlockhash();

// Generate a new keypair for the fee payer
const feePayer = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync("./id.json", "utf-8")))
);

console.log("current:", feePayer.publicKey.toBase58());

async function kp() {
  // Generate a new keypair for the recipient
  const recipient = Keypair.generate();
  console.log(`private key: ${recipient.secretKey}`);
  console.log(`public key:${recipient.publicKey.toBase58()}`);
}

// airdrop lamports
async function airdrop(lamports) {
  const airdropSignature = await connection.requestAirdrop(
    feePayer.publicKey,
    lamports
  );
  await connection.confirmTransaction({
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    signature: airdropSignature
  });
}

async function initToken() {
  const mintPubkey = await createMint(
    connection,
    feePayer,
    feePayer.publicKey, // Mint authority
    feePayer.publicKey, // Freeze authority
    9, // Decimals
    Keypair.generate(),
    {
      commitment: "confirmed"
    },
    TOKEN_PROGRAM_ID
  );
  console.log("Mint Address:", mintPubkey.toBase58());
}

// 创建 ATA账户
async function createATA(pubKey) {
  const associatedTokenAccount = await createAssociatedTokenAccount(
    connection,
    feePayer,
    mintPubkey,
    new PublicKey(pubKey),
    {
      commitment: "confirmed"
    },
    TOKEN_PROGRAM_ID
  );
  console.log("Associated Token Account Address:", associatedTokenAccount.toBase58());
}

// 铸造
async function mint(ata, amount) {
  const transactionSignature = await mintTo(
    connection,
    feePayer,
    mintPubkey,
    new PublicKey(ata),
    feePayer, // Authority (mint authority)
    amount,
    [],
    {
      commitment: "confirmed"
    },
    TOKEN_PROGRAM_ID
  );
  console.log(`Successfully minted ${amount} tokens to ${ata}`);
  console.log(`tx ${transactionSignature}`);
}


async function trans(to, amount) {
  const transactionSignature2 = await transfer(
    connection,
    feePayer,
    associatedTokenAccount,
    new PublicKey(to),
    feePayer.publicKey, // Owner of source account
    amount,
    [],
    {
      commitment: "confirmed"
    },
    TOKEN_PROGRAM_ID
  );
  console.log(`Successfully transferred ${amount} tokens`);
  console.log("Transaction Signature:", transactionSignature2);
}

async function account(ata) {
  const account = await getAccount(
    connection,
    new PublicKey(ata),
    "confirmed",
    TOKEN_PROGRAM_ID
  );
  console.log(
    "balance:",
    Number(account.amount),
    "tokens"
  );
}

// await kp();
// private key: 54,232,90,204,69,149,146,99,24,229,155,181,143,50,198,226,62,247,56,213,71,95,250,121,51,209,225,243,62,215,211,185,197,48,158,50,240,14,194,158,173,112,193,6,192,252,187,173,152,238,119,195,249,66,151,88,176,140,140,66,156,119,166,15
// public key:EGkKEkjuHZwYwy1FcQ8bNAgFxyNcwbrtqdZTK73DHiKx

// await airdrop(100000000);

// await initToken();
// Mint Address: 7R3e1QkcjvvV1c9dkAFAnmeo2xPJvTdwSRiuhgbMcERy

// await createATA("EGkKEkjuHZwYwy1FcQ8bNAgFxyNcwbrtqdZTK73DHiKx");
// Associated Token Account Address: 24xSadbvknrWZ8sRr1B96LtipXcnr6myhr5hV2fikosq

// await trans("24xSadbvknrWZ8sRr1B96LtipXcnr6myhr5hV2fikosq", 700000000);
// Successfully transferred 700000000 tokens
// Transaction Signature: 63dpNR3qYXFcZVe2k5itGiBun5a4Pg7eoAHDNQfRg9nnKjVEDDkDFaQhZ6meqGzedDb83pJBQazvEXuzpR3ycoDg

// await account("24xSadbvknrWZ8sRr1B96LtipXcnr6myhr5hV2fikosq");
// balance: 700000000 tokens