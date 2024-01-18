use anchor_lang::prelude::*;

#[error_code]
pub enum DistributionError {
    #[msg("This address is not admin wallet")]
    InvalidAdmin,
    #[msg("This address is not caller wallet")]
    InvalidCaller,
    #[msg("Mining is not allowed within 5 minutes")]
    InvalidMiningTime,
    #[msg("Passed block number is not valid")]
    InvalidBlockNumber,
}
