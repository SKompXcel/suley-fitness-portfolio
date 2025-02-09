import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link'
import clsx from 'clsx'

import { Container } from '@/components/Container'
import {
  TwitterIcon,
  InstagramIcon,
  GitHubIcon,
  LinkedInIcon,
} from '@/components/SocialIcons'
import portraitImage from '@/images/portrait.jpg'

function SocialLink({ className, href, children, icon: Icon }) {
  return (
    <li className={clsx(className, 'flex')}>
      <Link
        href={href}
        className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500" />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  )
}

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M6 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6Zm.245 2.187a.75.75 0 0 0-.99 1.126l6.25 5.5a.75.75 0 0 0 .99 0l6.25-5.5a.75.75 0 0 0-.99-1.126L12 12.251 6.245 7.187Z"
      />
    </svg>
  )
}

export default function About() {
  return (
    <>
      <Head>
        <title>Suleyman Kiani | About</title>
        <meta
          name="description"
          content="Hi, I'm Suleyman Kiani, a cloud solutions enthusiast, full-stack developer, and personal trainer passionate about problem-solving and fitness."
        />
      </Head>
      <Container className="mt-16 sm:mt-32">
        <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
          
          {/* Left Side - Portrait Image */}
          <div className="lg:pl-20">
            <div className="max-w-xs px-2.5 lg:max-w-none">
              <Image
                src={portraitImage}
                alt="Suleyman Kiani"
                sizes="(min-width: 1024px) 32rem, 20rem"
                className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
              />
            </div>
          </div>

          {/* Right Side - About Me Text */}
          <div className="lg:order-first lg:row-span-2">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
              I&apos;m Suleyman Kiani, also known as Suley.
            </h1>
            <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
              <p>Hey there! 👋</p>
              <p>
                I&apos;m a <strong>cloud solutions enthusiast, problem solver, full-stack developer, and personal trainer</strong>. 
                Whether I&apos;m <strong>designing scalable cloud architectures, developing full-stack applications, solving LeetCode problems, 
                or coaching clients in fitness</strong>, I thrive on pushing boundaries and helping others unlock their full potential.
              </p>
              <p>
                I graduated from <strong>McMaster University</strong> with a <strong>Bachelor of Applied Science in Computer Science</strong>, 
                where I developed a strong foundation in <strong>cloud computing, software engineering, and systems design</strong>. 
                I&apos;ve since applied my skills across a variety of domains, from deploying <strong>Next.js apps and Express.js backends 
                on AWS</strong> to architecting <strong>serverless infrastructures</strong> that scale seamlessly.
              </p>
              <p>
                I&apos;ve also solved <strong>500+ LeetCode problems</strong> (yes, for fun 😆) because I genuinely enjoy the 
                challenge of <strong>systems design, data structures, and optimization</strong>. 
                If you love a good challenge, check out my LeetCode profile:{" "}
                <a 
                  href="https://leetcode.com/u/kianis4/" 
                  className="text-blue-500 dark:text-blue-400 hover:underline"
                  target="_blank" 
                  rel="noopener noreferrer">
                  leetcode.com/u/kianis4/
                </a>.
              </p>
              <p>
                Beyond tech, I&apos;m a <strong>martial arts instructor and personal trainer</strong>, teaching 
                <strong> Kickboxing and Wado Ryu Karate</strong>. Martial arts has shaped my <strong>discipline, resilience, 
                and problem-solving mindset</strong>—all of which translate directly into my work as a developer.
              </p>
            </div>
          </div>

          {/* Right Side - Social Links (Restored) */}
          <div className="lg:pl-20">
            <ul role="list">
              <SocialLink href="https://www.instagram.com/svley/" icon={InstagramIcon} className="mt-4">
                Follow on Instagram
              </SocialLink>
              <SocialLink href="https://github.com/kianis4/" icon={GitHubIcon} className="mt-4">
                Follow on GitHub
              </SocialLink>
              <SocialLink href="https://www.linkedin.com/in/suleyman-kiani-9249a0240/" icon={LinkedInIcon} className="mt-4">
                Follow on LinkedIn
              </SocialLink>
              <SocialLink
                href="mailto:suley.kiani@outlook.com"
                icon={MailIcon}
                className="mt-8 border-t border-zinc-100 pt-8 dark:border-zinc-700/40"
              >
                suley.kiani@outlook.com
              </SocialLink>
            </ul>
          </div>

        </div>
      </Container>
    </>
  )
}
