import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import {
  ExternalLink,
  BrainCircuit,
  Bot,
  ShieldCheck,
  Brain,
  MessageSquare,
  Zap,
  BookOpenText,
  Code,
} from "lucide-react";

const learningResources = [
  {
    title: "Ethernaut (OpenZeppelin)",
    description: "Classic Web3/Solidity security CTF game.",
    href: "https://ethernaut.openzeppelin.com/",
    icon: <BookOpenText size={24} className="text-blue-500" />,
  },
  {
    title: "Damn Vulnerable DeFi",
    description: "Advanced challenges focused on DeFi exploits.",
    href: "https://www.damnvulnerabledefi.xyz/",
    icon: <Code size={24} className="text-green-500" />,
  },
  {
    title: "Secureum",
    description: "Comprehensive security learning resources and quizzes.",
    href: "https://secureum.xyz/",
    icon: <ShieldCheck size={24} className="text-red-500" />,
  },
  {
    title: "Solidity Docs",
    description: "Official language documentation.",
    href: "https://docs.soliditylang.org/",
    icon: <BookOpenText size={24} className="text-purple-500" />,
  },
  {
    title: "ConsenSys Diligence Blog",
    description: "In-depth security articles and research.",
    href: "https://consensys.io/diligence/blog",
    icon: <ShieldCheck size={24} className="text-orange-500" />,
  },
  {
    title: "Trail of Bits Blog",
    description: "Security research and tooling.",
    href: "https://blog.trailofbits.com/",
    icon: <Code size={24} className="text-indigo-500" />,
  },
  {
    title: "Smart Contract Programmer",
    description: "YouTube channel covering Solidity & Security.",
    href: "https://www.youtube.com/@smartcontractprogrammer",
    icon: <BookOpenText size={24} className="text-pink-500" />,
  },
  {
    title: "Solidity by Example",
    description: "Concise code examples for Solidity features.",
    href: "https://solidity-by-example.org/",
    icon: <Code size={24} className="text-teal-500" />,
  },
  {
    title: "CryptoZombies",
    description: "Interactive gamified Solidity tutorial.",
    href: "https://cryptozombies.io/",
    icon: <BrainCircuit size={24} className="text-lime-500" />,
  },
  {
    title: "Patrick Collins (YouTube)",
    description: "In-depth blockchain development courses.",
    href: "https://www.youtube.com/@PatrickAlphaC",
    icon: <BookOpenText size={24} className="text-cyan-500" />,
  },
  {
    title: "EatTheBlocks (YouTube)",
    description: "Blockchain development tutorials.",
    href: "https://www.youtube.com/@EatTheBlocks",
    icon: <Code size={24} className="text-rose-500" />,
  },
  {
    title: "OpenZeppelin Docs",
    description: "Docs for standard secure contract libraries.",
    href: "https://docs.openzeppelin.com/contracts/5.x/",
    icon: <ShieldCheck size={24} className="text-emerald-500" />,
  },
  {
    title: "Alchemy University",
    description: "Free comprehensive Web3 education.",
    href: "https://university.alchemy.com/",
    icon: <BookOpenText size={24} className="text-amber-500" />,
  },
  {
    title: "SWC Registry",
    description: "Smart Contract Weakness Classification.",
    href: "https://swcregistry.io/",
    icon: <ShieldCheck size={24} className="text-slate-500" />,
  },
  {
    title: "Immunefi",
    description: "Leading smart contract bug bounty platform.",
    href: "https://immunefi.com/",
    icon: <Code size={24} className="text-fuchsia-500" />,
  },
  {
    title: "EVM Codes",
    description: "Interactive EVM opcode reference.",
    href: "https://www.evm.codes/",
    icon: <BrainCircuit size={24} className="text-sky-500" />,
  },
  {
    title: "Web3 University",
    description: "Community-driven Web3 education platform.",
    href: "https://www.web3.university/",
    icon: <BookOpenText size={24} className="text-violet-500" />,
  },
  {
    title: "Awesome Solidity (GitHub)",
    description: "Curated list of Solidity resources.",
    href: "https://github.com/bkrem/awesome-solidity",
    icon: <Code size={24} className="text-stone-500" />,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-600 to-slate-950 py-12">
      <div className="container mx-auto px-4 max-w-4xl font-figtree">
        <h1 className="text-4xl font-bold mb-10 text-left bg-gradient-to-r from-blue-100 to-purple-500 text-transparent bg-clip-text">
          About EtherGuru
        </h1>

        <Card className="mb-8 bg-white dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700/60 shadow-xl">
          <CardHeader>
            <CardTitle>Why Smart Contract Security Matters</CardTitle>
            <CardDescription>
              The Immutable Nature of the Blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:mb-4 prose-a:text-primary hover:prose-a:text-primary/80">
            <p>
              Smart contracts deployed on blockchains like Ethereum are
              typically <strong>immutable</strong>. Once deployed, their code
              cannot be easily changed. This permanence is a powerful feature,
              ensuring predictability and trustlessness. However, it also means
              that any <strong>vulnerabilities</strong> or bugs present in the
              code at deployment time can be exploited, often with irreversible
              consequences like the permanent loss of funds.
            </p>
            <p>
              The Decentralized Finance (DeFi) ecosystem and other blockchain
              applications handle billions of dollars in value. Security
              vulnerabilities can lead to{" "}
              <strong>catastrophic financial losses</strong>, damage
              reputations, and erode user trust in the technology. Therefore,
              understanding common pitfalls and writing secure code is paramount
              for developers, auditors, and users alike.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-white dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700/60 shadow-xl">
          <CardHeader>
            <CardTitle>A History of Notable Smart Contract Hacks</CardTitle>
            <CardDescription>Learning from the Past</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              The history of Ethereum is marked by several high-profile hacks,
              each offering valuable lessons. Here are some key examples:
            </p>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="dao">
                <AccordionTrigger>The DAO Hack (2016)</AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:mb-4 prose-a:text-primary hover:prose-a:text-primary/80">
                  <p>
                    Perhaps the most infamous hack, exploiting a{" "}
                    <strong>recursive call vulnerability (reentrancy)</strong>{" "}
                    in The DAO&apos;s code. Attackers drained roughly 3.6 million
                    ETH, leading to a controversial hard fork of Ethereum and
                    the creation of Ethereum Classic.
                  </p>
                  <p>
                    Lesson: Beware of{" "}
                    <strong>reentrancy vulnerabilities</strong> where external
                    calls can recursively call back into the contract before
                    state updates are finalized. Use the{" "}
                    <strong>checks-effects-interactions</strong> pattern.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="parity1">
                <AccordionTrigger>
                  Parity Multisig Wallet Hack 1 (July 2017)
                </AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:mb-4 prose-a:text-primary hover:prose-a:text-primary/80">
                  <p>
                    A vulnerability in the Parity Multisig Wallet library
                    contract allowed an attacker to take ownership of wallets by
                    calling the <strong>`initWallet` function</strong> after
                    deployment. Around 150,000 ETH was stolen.
                  </p>
                  <p>
                    Lesson: Ensure <strong>initialization functions</strong> can
                    only be called once, typically during contract construction.{" "}
                    <strong>Access control</strong> is critical.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="parity2">
                <AccordionTrigger>
                  Parity Multisig Wallet Freeze (November 2017)
                </AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:mb-4 prose-a:text-primary hover:prose-a:text-primary/80">
                  <p>
                    Attackers compromised the <strong>frontend</strong> of the
                    Badger DAO website, injecting malicious scripts that
                    prompted users to approve{" "}
                    <strong>excessive token allowances</strong> to the
                    attacker&apos;s address, leading to over $120 million stolen.
                  </p>
                  <p>
                    Lesson: Smart contract security extends beyond the
                    blockchain. <strong>Frontend security</strong>, API key
                    management, and user awareness regarding token approvals are
                    crucial.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="bzx">
                <AccordionTrigger>
                  bZx Flash Loan Attacks (2020)
                </AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:mb-4 prose-a:text-primary hover:prose-a:text-primary/80">
                  <p>
                    A series of attacks utilized <strong>flash loans</strong> to
                    manipulate <strong>oracle price feeds</strong> and exploit
                    logic flaws within the bZx lending protocol, resulting in
                    significant losses.
                  </p>
                  <p>
                    Lesson: <strong>Oracles</strong> are critical security
                    components. Price feeds can be manipulated, especially
                    within a single transaction using flash loans. Relying on a
                    single source or manipulable on-chain data for critical
                    functions is risky.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="cream">
                <AccordionTrigger>
                  Cream Finance Exploits (2021)
                </AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:mb-4 prose-a:text-primary hover:prose-a:text-primary/80">
                  <p>
                    Cream Finance suffered multiple large hacks, often involving{" "}
                    <strong>flash loans</strong> and complex interactions
                    between different DeFi protocols, exploiting vulnerabilities
                    in collateral pricing or <strong>reentrancy</strong>.
                  </p>
                  <p>
                    Lesson: Complex interactions between protocols increase the
                    attack surface. Thorough auditing and understanding the{" "}
                    <strong>composability risks</strong> are essential.
                    Reentrancy guards and robust oracle solutions are vital.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="badger">
                <AccordionTrigger>
                  Badger DAO Frontend Attack (2021)
                </AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:mb-4 prose-a:text-primary hover:prose-a:text-primary/80">
                  <p>
                    Attackers compromised the <strong>frontend</strong> of the
                    Badger DAO website, injecting malicious scripts that
                    prompted users to approve{" "}
                    <strong>excessive token allowances</strong> to the
                    attacker&apos;s address, leading to over $120 million stolen.
                  </p>
                  <p>
                    Lesson: Smart contract security extends beyond the
                    blockchain. <strong>Frontend security</strong>, API key
                    management, and user awareness regarding token approvals are
                    crucial.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="ronin">
                <AccordionTrigger>Ronin Bridge Hack (2022)</AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:mb-4 prose-a:text-primary hover:prose-a:text-primary/80">
                  <p>
                    Attackers gained control over a majority of the{" "}
                    <strong>validator keys</strong> for the Ronin sidechain
                    bridge (used by Axie Infinity), allowing them to forge
                    withdrawals and steal over $600 million.
                  </p>
                  <p>
                    Lesson: <strong>Bridge security</strong> is critical for
                    cross-chain interactions.{" "}
                    <strong>Centralization points</strong>, like validator key
                    management, can be significant weaknesses. Multi-sig
                    security depends heavily on the security of the individual
                    signers.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="wormhole">
                <AccordionTrigger>Wormhole Bridge Hack (2022)</AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:mb-4">
                  <p>
                    Exploited a{" "}
                    <strong>signature verification vulnerability</strong> in the
                    bridge logic, allowing the attacker to mint 120k wETH (worth
                    ~$325 million) without depositing equivalent collateral.
                  </p>
                  <p>
                    Lesson: Cross-chain <strong>bridge security</strong> is
                    highly complex. Rigorous verification of cryptographic
                    signatures, input validation, and logic across different
                    chains is paramount. Audits are crucial.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="beanstalk">
                <AccordionTrigger>
                  Beanstalk Farms Flash Loan Attack (2022)
                </AccordionTrigger>
                <AccordionContent className="prose dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:mb-4">
                  <p>
                    An attacker used a <strong>flash loan</strong> to acquire
                    massive voting power in the Beanstalk Farms{" "}
                    <strong>governance protocol</strong>, then proposed and
                    instantly passed a malicious proposal to transfer protocol
                    funds ($182 million) to themselves.
                  </p>
                  <p>
                    Lesson: <strong>Governance mechanisms</strong> can be attack
                    vectors. Consider time-locks for proposals, flash loan
                    resistance for voting power calculation, and careful
                    validation of proposal execution logic.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Note: This list is not exhaustive. Many other significant
              incidents have occurred. Researching platforms like Rekt News
              provides deeper insights.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-white dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700/60 shadow-xl">
          <CardHeader>
            <CardTitle>The EtherGuru Approach</CardTitle>
            <CardDescription>Learn by Explaining</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-slate-700 dark:text-slate-300">
              EtherGuru offers a unique approach to learning smart contract
              security. Instead of focusing solely on coding exploits, we
              emphasize <strong>understanding and explaining</strong> the
              underlying vulnerabilities. This method fosters deeper
              comprehension and retention.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain size={20} className="text-slate-500" />
                    Deep Understanding
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 dark:text-slate-400">
                  Focus on grasping the &apos;why&apos; behind vulnerabilities,
                  not just the &apos;how&apos; of exploitation. Analyze the root
                  causes and potential impacts.
                </CardContent>
              </Card>
              <Card className="bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare size={20} className="text-slate-500" />
                    Clear Explanation
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 dark:text-slate-400">
                  Articulate the vulnerability, its exploitation steps, and
                  mitigation strategies concisely and accurately. Solidify your
                  knowledge by teaching it.
                </CardContent>
              </Card>
              <Card className="bg-slate-50/50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap size={20} className="text-slate-500" />
                    Active Learning
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600 dark:text-slate-400">
                  Engage with interactive challenges that require written
                  explanations, actively reinforcing concepts rather than
                  passive observation.
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700/60 shadow-xl">
          <CardHeader>
            <CardTitle>Further Learning Resources</CardTitle>
            <CardDescription>Expand Your Knowledge</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-slate-700 dark:text-slate-300">
              Continuous learning is key in the rapidly evolving field of
              blockchain security. Here are some excellent resources to deepen
              your understanding:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {learningResources.map((resource) => (
                <Link
                  key={resource.title}
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  passHref
                >
                  <Card className="h-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 transition-all duration-200 hover:shadow-md flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                        {resource.title}
                        <ExternalLink className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 dark:text-slate-400 pt-0 flex-grow">
                      {resource.description}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <p className="mt-6 prose dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:mb-4">
              EtherGuru aims to complement these resources by focusing on the
              explanatory aspect of security understanding. We encourage you to
              explore these platforms to gain practical coding experience and
              broader industry insights.
            </p>
            <p className="mt-4 prose dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:mb-4">
              Credit and inspiration for many challenges and concepts come from
              the pioneering work done by OpenZeppelin (Ethernaut), Tiny Bird
              Games (Damn Vulnerable DeFi), Secureum, and the broader Ethereum
              security community.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
