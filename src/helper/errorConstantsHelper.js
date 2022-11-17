const errors = {
    'signRequestPending': '',
    'switchRequestPending': 'A switch network request is pending. Check metamask.',
    'switchRequestMessage': 'Please switch network',
    'connectWalletRequestMessage': 'Connect your wallet first.',
    'selectToken': 'Select a token',
    'selectSourceTokenMessage': 'Please select source token first.',
    'tokenNotSelected': 'Please select a token first',
    'sourceTokenNotSelected': 'Source token not selected yet.',
    'destinationTokenNotSelected': 'Destination token not selected yet.',
    'metamask': {        
        'walletNotFound': 'Metamask not found.',
        'walletNotConnected': 'Wallet not connected to metamask',
        'networkNotFound': 'Unrecognized network. Adding network to metamask',
        'signMessageRequestPending': 'A sing message request is pending. Check metamask.',
        'signMessageRequestPendingOnBackAction': 'A sing message request is pending. Check metamask and decline request to go back.',
    },
    'amountGreaterThanBalance': `Amount can't be more then wallet balance`,
    'amountEqualToZero': `Amount can't be zero.`,
    'erc20Errors': {
        'NOT_A_CONTRACT': (title = '', address = '') =>  `${title} Address ${address.length > 0 ? '(' + address+ ')' : ''} is not a valid ERC-20 contract.`,
        'CONTRACT_NOT_FOUND': (title = '', address = '') => `${title} contract ${address.length > 0 ? '(' + address+ ')' : ''} does not exist.`
    },
    'tokenCouldNotList': "Token not listed here due to insufficient token balance",
    'tokenImported': "Token imported",
    'tokenWrapped': 'Token Wrapped Successfully!',
    'wrapTokenCouldNotSaved': 'Could not saved wrapped token.',
    'noWrapTokens': `You've not wapped any tokens yet`,
    'somethingWentWrong': 'Something went wrong!',
    'email': {
        'REQUIRED': 'Please provide an email address.',
        'INVALID': 'Invalid email address provided.',
        'INSTRUCTION_ALREADY_SENT': (emailAddress = '') =>  `Instructions sent on ${emailAddress} email address`,
        'INSTRUCTION_SENT': (emailAddress = '') =>  `Instructions will be send on ${emailAddress} email address shortly.`
    },
    'validator': {
        'REQUIRED': 'Please provide a valid address.',
        'ADDRESS_ALREADY_SET': "Validator address already set.",
        'ADDED': 'Validator address added successfully.',
    }
}


export default errors;
