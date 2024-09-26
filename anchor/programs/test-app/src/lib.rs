#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("5hwxVjB6cSGMEFGCMMDVSz8QLYHynfU4YecWaq89STNM");

#[program]
pub mod test_app {
    use super::*;

  
  pub fn create_entry(ctx: Context<CreateEntry>, title:String, message:String) -> Result<()>{
    let journal_entry = &mut ctx.accounts.journal_entry;
    journal_entry.owner = ctx.accounts.owner.key();
    journal_entry.title = title;
    journal_entry.message = message;
   
    Ok(())
  }

  pub fn update_entry(
    ctx: Context<UpdateEntry>,
    _title:String,
    new_message:String
  ) -> Result<()>{
     let journal_entry = &mut ctx.accounts.journal_entry;

    journal_entry.message = new_message;
     Ok(())
  }

  pub fn delete_entry(
    _ctx: Context<DeleteEntry>,
    _title:String
  ) -> Result<()>{
    Ok(())
  }
}

#[account]
// this is used to calculate the space required for an account on chain
#[derive(InitSpace)]
pub struct JournalEntryState{
  pub owner: Pubkey,
  #[max_len(20)] // when we use InitSpace, we use this to define the lenght of strings
  pub title: String,
  #[max_len(200)]
  pub message: String,
  pub entry_id: u64
}

#[derive(Accounts)] // we use this, when writing data structure for a context, for deserializing and validate list of acounts in the struct
#[instruction(title:String)] // we use this when pulling additional data 
pub struct CreateEntry<'info>{
  #[account(
    init,
    seeds = [title.as_bytes(), owner.key().as_ref()], //used to define a PDA(Program derived address)
    bump,
    payer = owner, //who's paying the rent for the account on chain
    space = 8 + JournalEntryState::INIT_SPACE, // calcuate space to know how much needs to be paid as rent 8 is used as discriminator
  )]
  pub journal_entry: Account<'info, JournalEntryState>,
  #[account(mut)]
  pub owner: Signer<'info>,
  pub system_program: Program<'info, System>
}
#[derive(Accounts)] // we use this, when writing data structure for a context, for deserializing and validate list of acounts in the struct
#[instruction(title:String)] // we use this when pulling additional data 
pub struct UpdateEntry<'info>{
  #[account(
    mut, //make it mutable bks the account will be changing
    seeds = [title.as_bytes(), owner.key().as_ref()], //used to define a PDA(Program derived address)
    bump,
    realloc = 8 + JournalEntryState::INIT_SPACE, // re allocate the rent by the space change, by recalculating the space
    realloc::payer = owner, 
    realloc::zero = true // reset space to zero before recalculating space
  )]
  pub journal_entry: Account<'info, JournalEntryState>,
  #[account(mut)]
  pub owner: Signer<'info>,
  pub system_program: Program<'info, System>
}
#[derive(Accounts)] // we use this, when writing data structure for a context, for deserializing and validate list of acounts in the struct
#[instruction(title:String)] // we use this when pulling additional data 
pub struct DeleteEntry<'info>{
  #[account(
    mut, //make it mutable bks the account will be changing
    seeds = [title.as_bytes(), owner.key().as_ref()], //used to define a PDA(Program derived address)
    bump,
    close = owner,
  )]
  pub journal_entry: Account<'info, JournalEntryState>,
  #[account(mut)]
  pub owner: Signer<'info>,
  pub system_program: Program<'info, System>
}