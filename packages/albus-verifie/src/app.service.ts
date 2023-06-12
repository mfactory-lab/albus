import { AlbusClient } from '@albus/sdk';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AnchorProvider, Program, Wallet, web3 } from '@project-serum/anchor';
import { Keypair } from '@solana/web3.js';
import { Buffer } from 'node:buffer';
import { IDL } from '../../albus-sdk/idl';
import fs from 'node:fs';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  @Cron('* * * * * *')
  async handleCron(cluster: string, keypair: string) {
    const opts = AnchorProvider.defaultOptions();
    const connection = new web3.Connection(cluster, opts.commitment);
    const walletKeypair = Keypair.fromSecretKey(Buffer.from(JSON.parse(fs.readFileSync(keypair).toString())));
    const wallet = new Wallet(walletKeypair);
    const provider = new AnchorProvider(connection, wallet, opts);
    const client = new AlbusClient(provider);
    const albusProgram = new Program(IDL, client.programId, provider);

    while (true) {
      const zkpRequests = await albusProgram.account.zkpRequest.all();
      const provedZkpRequests = zkpRequests.map(async (a) => {
        if (a.account.proof !== undefined) {
          const isVerified = await client.verifyProof(a.account.proof);
          if (isVerified) {
            await client.verify({
              zkpRequest: a.publicKey,
            });
          } else {
            await client.reject({
              zkpRequest: a.publicKey,
            });
          }
        }
      });
    }
  }
}
