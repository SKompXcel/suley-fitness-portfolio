import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link'
import clsx from 'clsx'

import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Container } from '@/components/Container'
import {
  InstagramIcon,
  GitHubIcon,
  LinkedInIcon,
} from '@/components/SocialIcons'
import image1 from '@/images/photos/image-1.jpg'
import image2 from '@/images/photos/image-2.jpg'
import image3 from '@/images/photos/image-3.jpg'
import image4 from '@/images/photos/image-4.jpg'
import image5 from '@/images/photos/image-5.png'
import video from '@/images/photos/progress.mp4'

import logoSKompXcel from '@/images/logos/SKompXcel.png'
import logoBTC from '@/images/logos/btc.png'
import logoGiftCash from '@/images/logos/giftcash.jpeg'
import logoSDI from '@/images/logos/sdi.jpeg'
import logoDevProtocol from '@/images/logos/devprotocol.png'
import { generateRssFeed } from '@/lib/generateRssFeed'
import { getAllArticles } from '@/lib/getAllArticles'
import { formatDate } from '@/lib/formatDate'

function MailIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M2.75 7.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z"
        className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500"
      />
      <path
        d="m4 6 6.024 5.479a2.915 2.915 0 0 0 3.952 0L20 6"
        className="stroke-zinc-400 dark:stroke-zinc-500"
      />
    </svg>
  )
}

function BriefcaseIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M2.75 9.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z"
        className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500"
      />
      <path
        d="M3 14.25h6.249c.484 0 .952-.002 1.316.319l.777.682a.996.996 0 0 0 1.316 0l.777-.682c.364-.32.832-.319 1.316-.319H21M8.75 6.5V4.75a2 2 0 0 1 2-2h2.5a2 2 0 0 1 2 2V6.5"
        className="stroke-zinc-400 dark:stroke-zinc-500"
      />
    </svg>
  )
}

function ArrowDownIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.75 8.75 8 12.25m0 0 3.25-3.5M8 12.25v-8.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Article({ article }) {
  return (
    <Card as="article">
      <Card.Title href={`/articles/${article.slug}`}>
        {article.title}
      </Card.Title>
      <Card.Eyebrow as="time" dateTime={article.date} decorate>
        {formatDate(article.date)}
      </Card.Eyebrow>
      <Card.Description>{article.description}</Card.Description>
      <Card.Cta>Read article</Card.Cta>
    </Card>
  )
}

function SocialLink({ icon: Icon, ...props }) {
  return (
    <Link className="group -m-1 p-1" {...props}>
      <Icon className="h-6 w-6 fill-zinc-500 transition group-hover:fill-zinc-600 dark:fill-zinc-400 dark:group-hover:fill-zinc-300" />
    </Link>
  )
}

function Newsletter() {
  return (
    <form
      action="/thank-you"
      className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40"
    >
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <MailIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">Stay up to date</span>
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Get notified when I publish something new, and unsubscribe at any time.
      </p>
      <div className="mt-6 flex">
        <input
          type="email"
          placeholder="Email address"
          aria-label="Email address"
          required
          className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/10 sm:text-sm"
        />
        <Button type="submit" className="ml-4 flex-none">
          Join
        </Button>
      </div>
    </form>
  )
}

function Resume() {
  let resume = [
    {
      company: 'SKompXcel',
      title: 'Founder',
      logo: logoSKompXcel,
      start: 'Jan 2024',
      end: 'Present',
      // start: '2019',
      // end: {
      //   label: 'Present',
      //   dateTime: new Date().getFullYear(),
      // },
    },
    {
      company: 'E&S Solns.',
      title: 'Co-Founder and Lead Developer',
      logo: logoDevProtocol,
      start: 'June 2023',
      end: 'Present',
    },
    {
      company: 'Burlington Training Center',
      title: 'Mixed Martial Arts/Fitness Instructor & IT Administrator',
      logo: logoBTC,
      start: 'March 2024',
      end: 'Present',
    },
    {
      company: 'GiftCash Inc.',
      title: 'Software Developer Intern',
      logo: logoGiftCash,
      start: 'May 2021',
      end: ' Aug 2022',
    },
    {
      company: 'SDI Labs.',
      title: 'Software Engineer Intern',
      logo: logoSDI,
      start: 'June 2019',
      end: ' Aug 2022',
    },
  ]

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <BriefcaseIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">Work</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {resume.map((role, roleIndex) => (
          <li key={roleIndex} className="flex gap-4">
            <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
              <Image src={role.logo} alt="" className="h-7 w-7" unoptimized />
            </div>
            <dl className="flex flex-auto flex-wrap gap-x-2">
              <dt className="sr-only">Company</dt>
              <dd className="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {role.company}
              </dd>
              <dt className="sr-only">Role</dt>
              <dd className="text-xs text-zinc-500 dark:text-zinc-400">
                {role.title}
              </dd>
              <dt className="sr-only">Date</dt>
              <dd
                className="ml-auto text-xs text-zinc-400 dark:text-zinc-500"
                aria-label={`${role.start.label ?? role.start} until ${
                  role.end.label ?? role.end
                }`}
              >
                <time dateTime={role.start.dateTime ?? role.start}>
                  {role.start.label ?? role.start}
                </time>{' '}
                <span aria-hidden="true">—</span>{' '}
                <time dateTime={role.end.dateTime ?? role.end}>
                  {role.end.label ?? role.end}
                </time>
              </dd>
            </dl>
          </li>
        ))}
      </ol>
      <Button href="./Suleyman_Kiani_RESUME_DEC_2024.pdf" variant="secondary" className="group mt-6 w-full">
        Download Resume
        <ArrowDownIcon className="h-4 w-4 stroke-zinc-400 transition group-active:stroke-zinc-600 dark:group-hover:stroke-zinc-50 dark:group-active:stroke-zinc-50" />
      </Button>
    </div>
  )
}

function Photos() {
  let rotations = ['rotate-2', '-rotate-2', 'rotate-2', 'rotate-2', '-rotate-2'];

  return (
    <div className="mt-16 sm:mt-20">
      <div className="-my-4 flex justify-center gap-5 overflow-hidden py-4 sm:gap-8 flex-wrap">
        {[image1, image2, image3, video, image5].map((media, mediaIndex) => {
          const isVideo = typeof media === 'string' && media.endsWith('.mp4');
          const src = typeof media === 'object' ? media.src : media;

          return (
            <div
              key={src}
              className={clsx(
                'relative aspect-[9/10] w-44 flex-none overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 sm:w-72 sm:rounded-2xl',
                rotations[mediaIndex % rotations.length]
              )}
            >
              {isVideo ? (
                <video autoPlay
                loop
                muted
                playsInline controls className="absolute inset-0 h-full w-full object-cover">
                  <source src={src} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <Image
                  src={src}
                  alt=""
                  width={500} // You need to provide width
                  height={600} // And height for Next.js images
                  sizes="(min-width: 640px) 18rem, 11rem"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home({ articles }) {
  return (
    <>
      <Head>
        <title>
          Suleyman Kiani | Home
        </title>
        <meta
          name="description"
          content="Hi, I'm Suleyman Kiani, a fitness and martial arts instructor, web developer, and enthusiast of chess and basketball."
        />
      </Head>
      <Container className="mt-9">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
            Welcome to My World – Cloud, Code, and Combat 💻🥋💪
          </h1>
          <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
            I’m Suleyman Kiani—also known as <strong>Suley</strong>. This site is more than just a portfolio; 
            it’s a place where <strong>technology, problem-solving, and fitness collide</strong>.
          </p>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            As a <strong>cloud solutions enthusiast, full-stack developer, problem solver, and personal trainer</strong>, 
            I built this platform using <strong>Next.js 14</strong> and deployed it with <strong>Vercel</strong>, integrating <strong>AWS cloud services</strong>—one of the many solutions I specialize in at <strong>E&S Solutions</strong>.
          </p>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            I created this space to <strong>document my journey, share insights, and connect with like-minded individuals</strong>. 
            Whether it’s <strong>breaking down complex cloud architectures, solving algorithmic challenges (500+ LeetCode problems and counting! 😆), 
            or coaching clients through fitness transformations</strong>, I love <strong>applying knowledge to real-world challenges</strong>.
          </p>

          {/* Updated Section Layout */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">🚀 Tech & Cloud Insights</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Articles on <strong>cloud architecture, DevOps, full-stack development, and automation</strong>.
              </p>
            </div>

            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">🥋 Fitness & Martial Arts</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                My experiences as a <strong>personal trainer & martial arts instructor</strong> in 
                <strong> Kickboxing & Wado Ryu Karate</strong>.
              </p>
            </div>

            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">🧠 Problem-Solving & Growth</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                My thoughts on <strong>learning, teaching, and overcoming challenges</strong>—both in tech and fitness.
              </p>
            </div>

            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">📖 Honest Experiences</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                The <strong>wins, struggles, and lessons learned along the way</strong>, because growth isn’t always linear.
              </p>
            </div>

            <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 sm:col-span-2">
              <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">💼 Projects & Resume</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                A showcase of <strong>my past work, technical projects, and professional experience</strong>—all in one place.
              </p>
            </div>
          </div>

          <p className="mt-8 text-base text-zinc-600 dark:text-zinc-400">
            <strong>Want to Connect?</strong> If you’re interested in <strong>collaborating, discussing cloud solutions, solving complex problems, 
            or even just chatting about fitness</strong>, feel free to explore and reach out!
          </p>

          <p className="mt-4 text-lg font-semibold text-blue-500 dark:text-blue-400">
            🚀 <a href="/projects" className="hover:underline">Check out my projects, resume, and more right here.</a>
          </p>

          <div className="mt-6 flex gap-6">
            <SocialLink
              href="https://www.instagram.com/svley/"
              aria-label="Follow on Instagram"
              icon={InstagramIcon}
            />
            <SocialLink
              href="https://github.com/kianis4"
              aria-label="Follow on GitHub"
              icon={GitHubIcon}
            />
            <SocialLink
              href="https://www.linkedin.com/in/suleyman-kiani"
              aria-label="Follow on LinkedIn"
              icon={LinkedInIcon}
            />
          </div>
        </div>
      </Container>
      <Photos />
      <Container className="mt-24 md:mt-28">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col gap-16">
            {articles.map((article) => (
              <Article key={article.slug} article={article} />
            ))}
          </div>
          <div className="space-y-10 lg:pl-16 xl:pl-24">
            <Newsletter />
            <Resume />
          </div>
        </div>
      </Container>
    </>
  )
}

export async function getStaticProps() {
  if (process.env.NODE_ENV === 'production') {
    await generateRssFeed()
  }

  return {
    props: {
      articles: (await getAllArticles())
        .slice(0, 4)
        .map(({ component, ...meta }) => meta),
    },
  }
}
