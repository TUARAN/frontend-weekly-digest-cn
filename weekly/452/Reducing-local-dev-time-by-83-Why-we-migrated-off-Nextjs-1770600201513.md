# Reducing local dev time by 83%: Why we migrated off Next.js

![](https://www.inngest.com/_next/image?url=%2Fassets%2Fblog%2Fmigrating-off-nextjs-tanstack-start%2Ffeatured-image.png&w=1920&q=95)
# Reducing local dev time by 83%: Why we migrated off Next.js

We care a lot about developer experience. But it&#x27;s hard to build beautiful experiences for customers, while grinding through 10-12 second page load times. Here&#x27;s how—and why—our team migrated from Next.js to Tanstack Start.

Jacob Heric·  1/30/2026  · 9 min read

At Inngest, DX is everything. Uniquely good, ergonomic APIs are why customers choose us, and stay with us. So it might not be surprising that every engineering decision follows the same checklist: **make it simple, make it obvious, make it delightful.** As such, it&#x27;s nearly impossible to separate how we want devs to feel when using Inngest, from how we want our own team to feel when *building* Inngest.

This is the story of how (and why) we migrated off Next.js.

## Early signals, and an attempt to make it work

When I arrived at Inngest nearly two years ago, the team had already gone all in on Next.js. They&#x27;d adopted the App Router while it was still in beta, [migrated from Vite in under a day](https://www.inngest.com/blog/migrating-from-vite-to-nextjs?ref=blog-migrating-off-nextjs-tanstack-start), and embraced RSC as the future of React. At the time, the promise was compelling: escape the blank loading states and network waterfalls of SPAs, get nested layouts and streaming out of the box, and consolidate on a single framework.

But the honeymoon didn&#x27;t last. Next.js optimizes for a specific workflow—dedicated frontend teams who live in the framework full-time. For us, a small team where most engineers wear many hats, the cognitive overhead was punishing. The "use client" / "use server" directives, the layered cache APIs, the muddy boundaries between RSC and client components—all of it added friction that compounded over time.

Engineers who didn&#x27;t spend most of their week in the frontend found themselves constantly fighting the framework rather than shipping features.

### Backing away from RSC

As a first step, we tried just backing away from RSC in favor of a minimal use of vanilla server components and an overriding preference for client components. This helped, and made the developer experience mostly manageable, at least for a little while.

But then things got slow. *Really slow.* **Initial page load times for local development pushed 10-12 seconds minimum.** The drumbeat in Slack: "I HATE this." "The frontend is so SLOW".

Everyone now agreed: Our own developer experience *sucked*.

### Adding Turbopack and upgrading Next.js

In an effort to salvage things, we upgraded Next.js, and used Vercel&#x27;s profiling tools to see if that might help. It didn&#x27;t.

So we tried Turbopack. We tried it twice, in fact. No small feat for a codebase of our size. Each migration required dependency upgrades and refactoring. It also meant that our local development and production environments were different, because Vercel only supported Webpack for production builds at the time.

This did cause us a few issues, and unfortunately did not help the local load times much, shaving off only a couple seconds on average.

It seemed Turbopack was not, in fact, *turbo.* It was time to look outside Next.js.

## Evaluating alternatives

![](https://www.inngest.com/assets/blog/migrating-off-nextjs-tanstack-start/figure-1-performance-comparison.png)

We needed faster local load times, a sensible router API, and clear conventions around server/client components. We prototyped three options: Tanstack Start, Deno Fresh, and React Router v7 (essentially Remix).

I&#x27;d used both Deno Fresh and Remix at previous startups for large, complex applications. Both are great. Deno&#x27;s performant, Typescript-first runtime and opinionated tooling is particularly appealing. React Router is battle tested. However, Fresh&#x27;s long delay between version 1 and 2 gave us pause, and Remix&#x27;s decision to merge into React Router, and then again break itself out into a separate preview platform made us think. As for Tanstack Start? It was still in release candidate (and still is as I write this!)

Nevertheless, I built prototypes with each, checking off required integrations and features. All passed with varying to varying degrees of effect. No obvious disqualifiers.

## Choosing and migrating to Tanstack

![](https://www.inngest.com/assets/blog/migrating-off-nextjs-tanstack-start/figure-2-migration-timeline.png)

Ultimately, we decided to go with Tanstack Start. Maybe that sounds like an unusual choice given the context I shared, but the team had already used Tanstack&#x27;s other offerings and were exceedingly optimistic about its direction.

When developer experience matters, having excited developers matters.

### Incremental, or brute force?

The next choice was whether we wanted to do this incrementally, or rip off the bandaid all at once.

**The brute force** **option** would be a question of time and resources. Auth and integrations were sorted during prototyping, but the unknown was route conversion effort.

**An incremental** **approach** would require conditional routing and imports from our shared component library, which leaned heavily on Next.js utilities. More infrastructure work.

To decide, I&#x27;d have to get a handle on the conversion effort of our typical routes. And the only way to really estimate that would be to try some.

### Ripping the bandaid off

We had two Next.js app heads, one for our dev server and one for our dashboard.

**The Dev Server** has a small subset of the dashboard routes so I started there, converting a few. To my surprise, that process went fast enough that I simply pressed on and converted them all in a few days. All in, the bandaid came off for the dev server in about a week.

For all of our shared components, I simply made copies wherever we used Next.js and used Tanstack equivalents. There were a few hiccups where our app heads referenced each other through our shared component library, but a few not-terrible interim type hacks made quick work of those.

**The dashboard,** on the other hand, took longer. More routes, more complexity. This stretched the project a bit longer, but it was still only a couple weeks of engineering effort for one engineer (with the help of AI).

## The results

Post migration, our DX is *dramatically* better. We rarely see initial local page load times go beyond 2-3 seconds, and that is always only on the first of **any** route loaded. All routes after the first are almost always instant in Tanstack. Unlike Next.js where the first local load of any given route is always slow. The drumbeat in Slack is now, "I cannot believe how snappy it is!"

### Technical tradeoffs

There&#x27;s a full breakdown on technical tradeoffs in this handy [comparison matrix](https://tanstack.com/start/latest/docs/framework/react/comparison), but for us, the core difference came down to trading Next.js&#x27;s convention-over-configuration approach. Swapping directives that were sometimes magical and often confusing, for Tanstack&#x27;s explicit route configuration and prescriptive data loader approach.

In the quick example comparison below, you&#x27;ll see the App Router in Next.js does share some conventions with Tanstack Router, but those who have used Remix will immediately notice the similarities to that.

### Next.js App Router

export default async function RootLayout({
  params: { environmentSlug },
  children,
}: RootLayoutProps) {
  const env = await getEnv(environmentSlug);

  return (
    <>
      <Layout activeEnv={env}>
        <Env env={env}>
          <SharedContextProvider>{children}</SharedContextProvider>
        </Env>
      </Layout>
    </>
  );
}

Typical co-mingling of layout and server-side data fetching. The only clue it&#x27;s a server-side fetch: `async/await`.

### Tanstack Router

export const Route = createFileRoute(&#x27;/_authed/env/$envSlug&#x27;)({
  component: EnvLayout,
  notFoundComponent: NotFound,
  loader: async ({ params }) => {
    const env = await getEnvironment({
      data: { environmentSlug: params.envSlug },
    });

    if (params.envSlug && !env) {
      throw notFound({ data: { error: &#x27;Environment not found&#x27; } });
    }

    return {
      env,
    };
  },
});

function EnvLayout() {
  const { env } = Route.useLoaderData();

  return (
    <>
      <EnvironmentProvider env={env}>
        <SharedContextProvider>
          <Outlet />
        </SharedContextProvider>
      </EnvironmentProvider>
    </>
  );
}

Here `getEnvironment` is a `createServerFn` that only executes on the server. The `useLoaderData` hook accesses route data client-side. This is basically Remix + [Tanstack server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions).

## How we used AI to help

![](https://www.inngest.com/assets/blog/migrating-off-nextjs-tanstack-start/figure-3-ai-workflow.png)

To keep architecture and patterns clean and consistent, we really only let AI do conversion grunt work. We&#x27;d convert a route and its children, establish patterns for server/client data fetches, then have AI copy those patterns to similar routes. Then we&#x27;d check what it did and clean it up as necessary. Repeat.

AI also helped with obscure bugs and TypeScript issues. By reducing grunt work and capping time on deep dives, we finished in a couple weeks with one engineer, and minimal impact to other feature development during final merge and UAT.

We only blocked feature development for two or three days during final merge and user acceptance testing. Without AI, this would have taken far longer and carried more risk.

## Lessons learned

This project was quick, and relatively painless. But I did collect a few tips that might help you, if you choose the same path.

### Lessons in Tanstack Start

**Build and compile early and often.** If you&#x27;ve got a significant amount of server-side code you will eventually run into issues where things get bundled into the client or the server that shouldn&#x27;t. Those can be very difficult to isolate from build error output. If you keep your change footprint small between builds, you&#x27;ll thank yourself when you run into issues.

**Don&#x27;t rely on dev mode alone.** We have been bit by some different behaviors between that and the built app. When in doubt, build and preview that locally with something like:

json"build": "pnpm build:tsc pnpm build:vite",
"build:tsc": "tsc --noEmit",
"build:vite": "vite build",
"start:local": "PORT=5173 node -r dotenv/config .output/server/index.mjs dotenv_config_path=.env.local"

### Lessons on the migration process

**Brute force means huge PRs.** On the process front, the rip-the-bandaid-off conversion process necessitates huge PRs that are very hard or impossible to review traditionally. We accepted this tradeoff and instead relied on extensive user acceptance testing. Doing this we were able to flip the switch with minimal disruption to users.

We had exactly one issue that was significant enough to warrant an instant rollback, which was in an integration flow that is very difficult to test outside production.

Given this, I&#x27;d say it is only worth investing in conversion-specific engineering and cutting over incrementally in very risk averse engineering environments.

## Making your own migration decision

If you&#x27;re ready to switch to Tanstack Start, the result of our migration is all open source in our UI monorepo: [https://github.com/inngest/inngest/tree/main/ui](https://github.com/inngest/inngest/tree/main/ui).

If you still need help deciding if/when this is right for you, or what other alternatives you should consider, here&#x27;s a quick reference guide (just based on my own experience!):

![](https://www.inngest.com/assets/blog/migrating-off-nextjs-tanstack-start/framework-migration-decision.png)

Of course, you can also just hit me up in the Inngest [discord](https://www.inngest.com/discord?ref=blog-migrating-off-nextjs-tanstack-start).

And of course, if you need to add durability to serverless and event-driven workflows, but want to avoid infrastructure hell, check out inngest.com.

## Get started with Inngest

Sign up for free and start building reliable workflows today.
[Start for free](https://app.inngest.com/sign-up?ref=blog-migrating-off-nextjs-tanstack-start)
## Chat with a solutions expert

Connect with us to see if Inngest fits your queuing and orchestration needs.
[Contact us](https://www.inngest.com/contact?ref=blog-migrating-off-nextjs-tanstack-start)