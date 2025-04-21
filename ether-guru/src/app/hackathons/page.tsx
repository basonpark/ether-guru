import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Trophy,
  Target,
  Code,
  Search,
  TrendingUp,
  ExternalLink,
  Lightbulb,
} from "lucide-react"; // Icons

export default function HackathonsPage() {
  return (
    <div className="container mx-auto px-20 py-16 md:px-6 lg:py-20 bg-gradient-to-br from-slate-50 to-slate-200 dark:bg-gradient-to-br dark:from-slate-950 dark:to-slate-800 min-h-screen">
      <header className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl md:text-6xl mb-4">
          Hackathons & Bug Bounties
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-400">
          Dive into real-world challenges, test your smart contract skills, find
          vulnerabilities, and accelerate your learning journey.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6 flex items-center">
          <Lightbulb className="mr-3 h-7 w-7 text-slate-600 dark:text-slate-400" />{" "}
          Why Participate?
        </h2>
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">
          Hackathons and bug bounty programs are invaluable for aspiring and
          experienced smart contract developers and auditors. They offer:
        </p>
        <ul className="list-disc list-inside space-y-2 text-lg text-slate-700 dark:text-slate-300">
          <li>
            <strong>Hands-On Experience:</strong> Apply theoretical knowledge to
            practical problems under pressure.
          </li>
          <li>
            <strong>Skill Validation:</strong> Prove your abilities by building
            projects or finding real vulnerabilities.
          </li>
          <li>
            <strong>Learning Opportunities:</strong> Discover new tools,
            techniques, and common pitfalls. Learn from mentors and peers.
          </li>
          <li>
            <strong>Networking:</strong> Connect with fellow developers,
            potential employers, and industry experts.
          </li>
          <li>
            <strong>Portfolio Building:</strong> Showcase your work and
            successful bug findings.
          </li>
          <li>
            <strong>Financial Rewards:</strong> Earn significant prizes and
            bounties for your skills.
          </li>
        </ul>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6 flex items-center">
          <Trophy className="mr-3 h-7 w-7 text-slate-600 dark:text-slate-400" />{" "}
          Major Blockchain Hackathons
        </h2>
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
          These are recurring events known for attracting top talent and
          focusing on specific ecosystems or broader Web3 innovation. Keep an
          eye on their websites for upcoming dates.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Hackathon Cards here */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between group">
                ETHGlobal
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </CardTitle>
              <CardDescription>
                Premier Ethereum-focused hackathons (online & in-person).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="https://ethglobal.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Visit ETHGlobal
              </Link>
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between group">
                Solana Hackathons
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </CardTitle>
              <CardDescription>
                Major events like Breakpoint, Grizzlython, often with large
                prize pools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="https://spl_governance.crsp.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Visit Solana Events
              </Link>
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between group">
                Chainlink Hackathons
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </CardTitle>
              <CardDescription>
                Focused on building dApps using Chainlink oracles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="https://chain.link/hackathon"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Visit Chainlink Hackathons
              </Link>
            </CardContent>
          </Card>
          {/* Add Polygon */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between group">
                Polygon Hackathons
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </CardTitle>
              <CardDescription>
                Hackathons focused on the Polygon ecosystem and scaling
                solutions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Note: Polygon hackathon links change, direct user to broader dev portal/events */}
              <Link
                href="https://polygon.technology/developers/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Explore Polygon Devs
              </Link>
            </CardContent>
          </Card>
          {/* Add NEAR */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between group">
                NEAR MetaBUIDL
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </CardTitle>
              <CardDescription>
                Major hackathon series for the NEAR Protocol ecosystem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Link might change per event */}
              <Link
                href="https://near.org/events/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Explore NEAR Events
              </Link>
            </CardContent>
          </Card>
          {/* Add Avalanche */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between group">
                Avalanche Creates / Summits
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </CardTitle>
              <CardDescription>
                Events often including hackathons for the Avalanche network.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link
                href="https://www.avax.network/developers"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Explore Avalanche Devs
              </Link>
            </CardContent>
          </Card>
          {/* Add Devfolio */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between group">
                Devfolio
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </CardTitle>
              <CardDescription>
                Popular platform hosting numerous Web3 hackathons globally.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Note: Polygon hackathon links change, direct user to broader dev portal/events */}
              <Link
                href="https://devfolio.co/hackathons"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Explore Devfolio Hackathons
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6 flex items-center">
          <Target className="mr-3 h-7 w-7 text-slate-600 dark:text-slate-400" />{" "}
          Smart Contract Bug Bounty Platforms
        </h2>
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
          Get paid to find security vulnerabilities in smart contracts. Rewards
          can range from hundreds to millions of dollars depending on the
          severity and the project's budget.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Bounty Platform Cards here */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between group">
                Immunefi
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </CardTitle>
              <CardDescription>
                Leading platform dedicated to Web3/smart contract security.
                Highest bounties.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                Rewards: $1k - $10M+
              </p>
              <Link
                href="https://immunefi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Visit Immunefi
              </Link>
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between group">
                Code4rena (C4)
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </CardTitle>
              <CardDescription>
                Competitive audit contests where multiple auditors review code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                Rewards: Shared Prize Pools (e.g., $50k - $200k+)
              </p>
              <Link
                href="https://code4rena.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Visit Code4rena
              </Link>
            </CardContent>
          </Card>
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between group">
                HackerOne
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </CardTitle>
              <CardDescription>
                Major bug bounty platform, includes many Web3/blockchain
                projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                Rewards: Variable by project
              </p>
              <Link
                href="https://hackerone.com/blockchain"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Visit HackerOne (Blockchain)
              </Link>
            </CardContent>
          </Card>
          {/* Add HackenProof */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between group">
                HackenProof
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </CardTitle>
              <CardDescription>
                Bug bounty platform with a strong focus on blockchain security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                Rewards: Variable by project
              </p>
              <Link
                href="https://hackenproof.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Visit HackenProof
              </Link>
            </CardContent>
          </Card>
          {/* Add Sherlock */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between group">
                Sherlock
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </CardTitle>
              <CardDescription>
                Platform for audit competitions and smart contract coverage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                Rewards: Audit Contest Pools
              </p>
              <Link
                href="https://sherlock.xyz/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Visit Sherlock
              </Link>
            </CardContent>
          </Card>
          {/* Add Hats.finance */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-300/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between group">
                Hats.finance
                <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              </CardTitle>
              <CardDescription>
                Decentralized cybersecurity network with bug bounties as vaults.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                Rewards: Vault-based Bounties
              </p>
              <Link
                href="https://hats.finance/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Visit Hats.finance
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6 flex items-center">
          <Search className="mr-3 h-7 w-7 text-slate-600 dark:text-slate-400" />{" "}
          Finding Ongoing Events & Bounties
        </h2>
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
          Hackathons and bounties are constantly launching. Here’s where to look
          for current opportunities:
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 list-none">
          <li>
            <Link
              href="https://ethglobal.com/events"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center group"
            >
              <ExternalLink className="mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              ETHGlobal Events Page
            </Link>
          </li>
          <li>
            <Link
              href="https://devpost.com/hackathons?search=blockchain&challenge_type=ongoing&status=upcoming"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center group"
            >
              <ExternalLink className="mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              Devpost (Filter for Blockchain/Web3)
            </Link>
          </li>
          <li>
            <Link
              href="https://devfolio.co/hackathons"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center group"
            >
              <ExternalLink className="mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              Devfolio Hackathons
            </Link>
          </li>{" "}
          {/* Added Devfolio explicit link here too */}
          <li>
            <Link
              href="https://immunefi.com/explore/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center group"
            >
              <ExternalLink className="mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              Immunefi Bounties
            </Link>
          </li>
          <li>
            <Link
              href="https://code4rena.com/audits"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center group"
            >
              <ExternalLink className="mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              Code4rena Audits
            </Link>
          </li>
          <li>
            <Link
              href="https://hackenproof.com/programs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center group"
            >
              <ExternalLink className="mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              HackenProof Programs
            </Link>
          </li>
          <li>
            <Link
              href="https://sherlock.xyz/audits/contests"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center group"
            >
              <ExternalLink className="mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              Sherlock Audit Contests
            </Link>
          </li>
          <li>
            <Link
              href="https://app.hats.finance/vaults"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center group"
            >
              <ExternalLink className="mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              Hats.finance Vaults
            </Link>
          </li>
          <li>
            <Link
              href="https://gitcoin.co/grants"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center group"
            >
              <ExternalLink className="mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              Gitcoin Grants
            </Link>
          </li>
          <li>
            <Link
              href="https://layer3.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center group"
            >
              <ExternalLink className="mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              Layer3 (Quests & Bounties)
            </Link>
          </li>
          <li>
            <Link
              href="https://bounties.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center group"
            >
              <ExternalLink className="mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              Bounties Network
            </Link>
          </li>
          <li>
            <Link
              href="https://web3.career/hackathons"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center group"
            >
              <ExternalLink className="mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              Web3 Career Hackathons
            </Link>
          </li>
          <li>
            <Link
              href="https://dorahacks.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center group"
            >
              <ExternalLink className="mr-2 h-4 w-4 text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
              DoraHacks
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
