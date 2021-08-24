import { LCDClient } from '@terra-money/terra.js';

import { columbus4, AddressProviderFromJson, MARKET_DENOMS, queryMarketBorrowerInfo, queryOverseerBorrowLimit, queryLiquidationConfig } from '@anchor-protocol/anchor.js'

const addressProvider = new AddressProviderFromJson(columbus4);
const lcd = new LCDClient({ URL: 'https://lcd.terra.dev', chainID: 'columbus-4' });

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getBorrowerInfo(addr) {
  const query = queryMarketBorrowerInfo({lcd, market: MARKET_DENOMS, borrower: addr});
  const resp = await query(addressProvider);
  return resp;
}

async function getBorrowLimit(addr) {
  const query = queryOverseerBorrowLimit({lcd, market: MARKET_DENOMS, borrower: addr});
  const resp = await query(addressProvider);
  return resp.borrow_limit;
}

async function getSafeRatio() {
  const query = queryLiquidationConfig({lcd});
  const resp = await query(addressProvider);
  return resp.safe_ratio;
}

async function main() {
  const addr = process.env.TERRA_ADDRESS;

  const resp = await getBorrowerInfo(addr);
  const loanValue = resp.loan_amount;

  const borrowLimit = await getBorrowLimit(addr);
  const safeRatio = await getSafeRatio();

  const riskRatio = loanValue / borrowLimit; // https://docs.anchorprotocol.com/protocol/loan-liquidation#collateral-liquidation
  const isSafe = safeRatio > riskRatio;

  const info = {
    loanValue,
    borrowLimit,
    safeRatio,
    riskRatio,
    isSafe,
  };

  console.log(JSON.stringify(info));
}

main().catch(console.error);
