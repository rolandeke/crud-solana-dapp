#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("5npb22qaS4eHN6njpLZpUxPKwG4jaaVAhrDdWQ37Q85F");

#[program]
pub mod test_app {
    use super::*;

  pub fn close(_ctx: Context<CloseTestApp>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.test_app.count = ctx.accounts.test_app.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.test_app.count = ctx.accounts.test_app.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeTestApp>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.test_app.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeTestApp<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + TestApp::INIT_SPACE,
  payer = payer
  )]
  pub test_app: Account<'info, TestApp>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseTestApp<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub test_app: Account<'info, TestApp>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub test_app: Account<'info, TestApp>,
}

#[account]
#[derive(InitSpace)]
pub struct TestApp {
  count: u8,
}
