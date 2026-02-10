# Remix vs. Next.js vs. SvelteKit

# Remix vs. Next.js vs. SvelteKit

    
        
            ![](https://blog.logrocket.com/wp-content/uploads/2021/07/7D1BB823-5BC3-40E9-AF0C-ABE25780213F.jpg?w=150&h=150&crop=1)        
        
            [Alex Merced](https://blog.logrocket.com/author/alexmerced/)
            I am a developer, educator, and founder of devNursery.com.
        
    

    
        
            
                                

            
            
                Table of contents            
            **
            **
        
        
    
        [Initiating a project](https://blog.logrocket.com/react-remix-vs-next-js-vs-sveltekit/#initiating-a-project)
        

        
        [Routing](https://blog.logrocket.com/react-remix-vs-next-js-vs-sveltekit/#routing)
        

        
        [Loading data on the server side](https://blog.logrocket.com/react-remix-vs-next-js-vs-sveltekit/#loading-data-on-the-server-side)
        

        
        [Pre-rendering pages as static site generators](https://blog.logrocket.com/react-remix-vs-next-js-vs-sveltekit/#pre-rendering-pages-as-static-site-generators)
        

        
        [API routing](https://blog.logrocket.com/react-remix-vs-next-js-vs-sveltekit/#api-routing)
        

        
        [Styling](https://blog.logrocket.com/react-remix-vs-next-js-vs-sveltekit/#styling)
        

        
        [Error handling](https://blog.logrocket.com/react-remix-vs-next-js-vs-sveltekit/#error-handling)
        

        
        [Deployment](https://blog.logrocket.com/react-remix-vs-next-js-vs-sveltekit/#deployment)
        

        
        [Where does React Router v7 really differ?](https://blog.logrocket.com/react-remix-vs-next-js-vs-sveltekit/#where-does-react-router-v7-really-differ)
        

        
        [Conclusion](https://blog.logrocket.com/react-remix-vs-next-js-vs-sveltekit/#conclusion)
        

    
    
                
    
        ![](https://blog.logrocket.com/wp-content/uploads/2023/12/GalileoAIPreview.png)
    
    Introducing Galileo AI
    LogRocket’s Galileo AI watches every session, surfacing impactful user struggle and key behavior patterns.
    
        [LEARN MORE](https://logrocket.com/products/galileo-ai)
    

            
        
        

    
        ![](https://blog.logrocket.com/wp-content/uploads/2023/04/logrocket-logo-1.png)
        
            
## See how LogRocket's Galileo AI surfaces the most severe issues for you

            
### No signup required

        
        Check it out
    
    
        
            
            
        
    




            

    
    
    

***Editor’s note:** This article was last updated in January 2026 by [Muhammed Ali](https://blog.logrocket.com/author/muhammedali/) to reflect the Remix and React Router v7 merger, updated static site generation capabilities, modern error handling patterns, and the latest framework conventions.*
![](https://blog.logrocket.com/wp-content/uploads/2021/12/react-svelte-next-js.png)

Remix, the full-stack web framework created by the team behind React Router, has evolved significantly. Most notably, Remix has been unified with React Router v7, bringing its data loading, routing, and resilience primitives directly into React Router itself. This shift marks an important change in the React ecosystem, allowing developers to build fast, resilient applications while working within the familiar React Router model.

Within the past few years, the usage of the SaaS paradigm, the business model typically used by open source technologies in the cloud, has been solidified within the industry. For example, React meta-frameworks Next.js and Gatsby both offer paid hosting services with additional features that are tailored for optimization.

Similarly, Shopify released a React meta-framework called [Hydrogen](https://hydrogen.shopify.dev/) as well as a[ hosting service](https://shopify.dev/docs/storefronts/headless/hydrogen/getting-started) for it called Oxygen. Databases like Neo4j, ArangoDB, and MongoDB each offer cloud database services that make adoption and usage easier.

Meanwhile, Vercel, the creators behind the Remix competitor Next.js, have had an interesting development in hiring [Svelte creator](https://vercel.com/blog/vercel-welcomes-rich-harris-creator-of-svelte) Rich Harris to work full-time on SvelteKit, the primary Svelte meta-framework.

As a [framework for server-side rendering](https://blog.logrocket.com/guide-to-remix-react-framework/), Remix aims to fulfill some of the same needs as frameworks like Next.js and SvelteKit. In this article, we’ll compare a few of their features, ranging from initiating a project to adding styling. At the end of this article, you should be better equipped to select one for your unique project. Let’s get started!

*N.B., the equivalent meta-frameworks for Vue, Angular, and [SolidJS](https://blog.logrocket.com/introduction-solidjs/) would be Nuxt.js, Angular Universal, and SolidStart, respectively.*


    
    
### 🚀 Sign up for The Replay newsletter

    
[ **The Replay**](https://blog.logrocket.com/the-replay-archive/)  is a weekly newsletter for dev and engineering leaders.

    
Delivered once a week, it's your curated guide to the most important conversations around frontend dev, emerging AI tools, and the state of modern software.

    
	Notice: JavaScript is required for this content.

    

        
        
        





## Initiating a project

First, we’ll look at the commands you’ll use to scaffold a new project in each framework:

# React Router v7 (formerly Remix)
npx create-react-router@latest

# Next.js
npx create-next-app@latest

# SvelteKit
npx sv create my-app

When generating a React Router v7 project, you can choose from templates designed for different hosting platforms, such as Netlify, Cloudflare, Fly.io, and Vercel. Each template includes deployment-specific setup and documentation to streamline the process.

## Routing

Routing determines what URL you’ll need to access different pages on the website. All three meta-frameworks use file-based routing, which is primarily what all meta-frameworks use. The URL is based on the name and location of the file for that particular page.

Below, you’ll see some examples of how different files get mapped to URLs in each meta-framework, including an example with URL params, which define a part of the URL as a variable that you can retrieve.

### React Router v7 (Remix)

React Router v7 builds on the foundations of React Router v6, adding first-class server-side capabilities. As a result, you can continue to use familiar Hooks such as `useParams` and `useNavigate` in your client-side code to handle navigation.

/ → app/routes/home.tsx
/hello → app/routes/hello.tsx
/use_param/:id → app/routes/use_param.$id.tsx

### Next.js

With the App Router (recommended):

/ → app/page.js
/hello → app/hello/page.js
/use_param/:id → app/use_param/[id]/page.js

With the Pages Router (legacy):

/ → pages/index.js
/hello → pages/hello/index.js or pages/hello.js
/use_param/:id → pages/use_param/[id].js

### SvelteKit

/ → src/routes/+page.svelte
/hello → src/routes/hello/+page.svelte
/use_param/:id → src/routes/use_param/[id]/+page.svelte

**Note:** SvelteKit v1 and later uses the `+page.svelte` convention instead of `index.svelte`.

## Loading data on the server side

A major benefit of using a meta-framework is handling a lot of data preparation prior to your page hydrating, like API calls, transformations, etc. When you use a meta-framework, you don’t have to prepare loaders or things like the `useEffect` Hook to deal with the asynchronous nature of these issues.

In all three meta-frameworks, there is a function on each page that we can define, which will be run from the server prior to shipping the page to the user’s browser.

### React Router v7 (Remix)

In React Router v7, you define a `loader` function that receives contextual information such as URL parameters and the incoming request. This function is responsible for preparing any data the route needs and returning it. The returned data can then be accessed inside the component using the `useLoaderData` Hook, as shown below:

import { useLoaderData } from "react-router";

export async function loader({ params, request }) {
  // get a param from the url
  const id = params.id;
  // getting data from the url query string
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit");

  return { id, limit };
}

export default function SomePage() {
  const { id, limit } = useLoaderData();
  return (
    <div>
      <h1>The params is: {id}</h1>
      <h1>The limit url query is: {limit}</h1>
    </div>
  );
}

### Next.js

With the App Router, Next.js uses async Server Components and the `params` and `searchParams` props:

export default async function SomePage({ params, searchParams }) {
  // params are automatically unwrapped in the component
  const id = params.id;
  // getting data from the url query string
  const limit = searchParams.limit;

  return (
    <div>
      <h1>The params is: {id}</h1>
      <h1>The limit url query is: {limit}</h1>
    </div>
  );
}

With the Pages Router (legacy), you can export a function called `getServerSideProps`:

export const getServerSideProps = async ({ params, query }) => {
  const id = params.id;
  const limit = query.limit;

  return { props: { id, limit } };
};

export default function SomePage({ id, limit }) {
  return (
    <div>
      The params is: {id}
      
      The limit url query is: {limit}
    </div>
  );
}

### SvelteKit

With SvelteKit, you define a `load` function in a `+page.js` or `+page.ts` file:

// +page.js
export async function load({ params, url }) {
  // get params from url
  const id = params.id;
  // get data from url query
  const limit = url.searchParams.get("limit");

  return {
    id,
    limit
  };
}

<!-- +page.svelte -->
<script>
  export let data;
</script>

<div>
  <h1>The params is: {data.id}</h1>
  <h1>The limit url query is: {data.limit}</h1>
</div>

## Pre-rendering pages as static site generators

Pre-rendering pages for static site generation has evolved significantly across all three frameworks.

### React Router v7 (Remix)

React Router v7 now supports static site generation through pre-rendering. You can configure routes to be pre-rendered at build time by exporting a `prerender` function from your route module or configuring it in your app configuration. This makes it viable for blogs, marketing sites, and other content-heavy applications.

      

  
![](https://blog.logrocket.com/wp-content/uploads/2022/11/Screen-Shot-2022-09-22-at-12.50.47-PM.png)
  
  
    
## Over 200k developers use LogRocket to create better digital experiences

      ![](https://blog.logrocket.com/wp-content/uploads/2022/08/rocket-button-icon.png)Learn more →  
  

### Next.js

Next.js offers multiple rendering strategies. With the App Router, you can use:

- Static generation – Components are rendered at build time by default

- Dynamic rendering – Use dynamic functions like `cookies()`, `headers()`, or dynamic `searchParams`

- Incremental static regeneration (ISR) – Revalidate static pages after deployment

// Static generation with revalidation
export const revalidate = 3600; // Revalidate every hour

export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  return (
    <div>{/* content */}</div>
  );
}

With the Pages Router (legacy), you export `getStaticProps` for static generation:

export async function getStaticProps() {
  return {
    props: { data },
    revalidate: 3600 // ISR
  };
}

### SvelteKit

In SvelteKit, you can enable pre-rendering on a per-page basis:

// +page.js
export const prerender = true;

Or configure it globally in `svelte.config.js` to pre-render your entire site.

## API routing

While we can handle logic on the server side with `loader`, you may still need dedicated API URLs with code that is only visible and run on the server side.

### React Router v7 (Remix)

If you create a route that doesn’t export a component, then it will be treated as a resource route that can create a JSON response:

export function loader({ params }) {
  const id = params.id;
  return Response.json({ id }, {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

### Next.js

With the App Router, you create Route Handlers in `route.js` files:

// app/api/user/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  return Response.json({ id });
}

With the Pages Router (legacy), you create API routes in the `pages/api` folder:

export default function handler(req, res) {
  res.status(200).json({ id: req.query.id });
}

### SvelteKit

Create a `+server.js` file to define API endpoints:

// +server.js
export async function GET({ params, url }) {
  return new Response(JSON.stringify({ id: params.id }), {
    headers: { 'content-type': 'application/json' }
  });
}

## Styling

When it comes to styling, the three frameworks can differ quite a lot.

### React Router v7 (Remix)

React Router v7 provides a built-in way to link traditional CSS stylesheets by exporting a `links` function. In addition, it supports CSS Modules, Tailwind CSS, and popular CSS-in-JS solutions:

export function links() {
  return [
    {
      rel: "stylesheet",
      href: "https://unpkg.com/[[email&#160;protected]](https://blog.logrocket.com/cdn-cgi/l/email-protection)/dist/reset.min.css"
    }
  ];
}

### Next.js

Next.js offers comprehensive styling options:

- CSS modules – Built-in support with `.module.css` files

- Tailwind CSS – First-class support with automatic configuration

- CSS-in-JS – Support for styled-components, Emotion, and other libraries

- Sass – Built-in support for `.scss` and `.sass` files

- Global CSS – Import CSS files in your root layout

With the App Router, you can use CSS directly in Server Components:

import './styles.css';

export default function Page() {
  return (
    <div>Content</div>
  );
}

### SvelteKit

Like Vue, Svelte uses single-file components, so the CSS is scoped to the component by default:

<style>
  h1 {
    color: blue;
  }
</style>

<h1>Hello World</h1>

You can also use global styles, CSS preprocessors, or Tailwind CSS.

## Error handling

Despite your best efforts to ship applications that are highly performant and bug-free, errors are bound to occur. The web does not run on your `localhost`, hence the need to prepare for these errors and handle them if and when they do pop up.

### React Router v7 (Remix)

React Router v7 includes built-in error handling for both server and client rendering. Error boundaries don’t prevent the entire page from rendering; instead, they replace only the portion of the UI where the error occurs. Errors propagate up the route hierarchy until an appropriate error boundary is found and rendered:

import { useRouteError } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div>
      <p>An error occurred!</p>
      <pre className="mt-4">{error.message}</pre>
    </div>
  );
}

### Next.js

With the App Router, Next.js uses special `error.js` files that automatically create error boundaries:

// error.js
'use client'; // Error components must be Client Components

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}

You can also create `global-error.js` to catch errors in the root layout. With the Pages Router (legacy), you would use React’s ErrorBoundary component pattern.

### SvelteKit

SvelteKit handles errors using `+error.svelte` files. You can throw errors using the `error` helper:

// +page.js
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const post = await db.getPost(params.slug);

  if (!post) {
    throw error(404, {
      message: 'Post not found!'
    });
  }

  return { post };
}

<!-- +error.svelte -->
<script>
  import { page } from '$app/stores';
</script>

<h1>{$page.status}: {$page.error.message}</h1>

## Deployment

### React Router v7 (Remix)

Several platforms like [Vercel](https://vercel.com/guides/deploying-remix-with-vercel), [Render](https://render.com/docs/deploy-remix),[ Netlify](https://www.netlify.com/blog/how-to-deploy-remix-apps-on-netlify/), and [Cloudflare](https://developers.cloudflare.com/pages/framework-guides/remix/) provide walkthrough guides that cover how to deploy Remix applications. The framework also provides [several templates](https://github.com/remix-run/react-router-templates) you can utilize for quick deployment using the CLI.

### Next.js

Vercel, the creators behind Next.js, is usually the first option for deploying Next.js apps. Next.js provides more deployment flexibility because it can be [deployed](https://nextjs.org/learn/basics/deploying-nextjs-app/other-hosting-options) to any hosting provider that supports Node.js. Some of these hosting providers include Netlify, Cloudflare, Render, AWS, and Heroku. Note that Next.js has more deployment options than SvelteKit and Remix.

### SvelteKit

Vercel and Render provide direct, first-class support for quickly deploying SvelteKit applications from GitHub, GitBucket, and GitLab. For other platforms, you can utilize SvelteKit’s [Adapters API](https://svelte.dev/docs/kit/adapters) to optimize for deployment. Netlify and Cloudflare provide guides on how to deploy SvelteKit applications with adapters.

## Where does React Router v7 really differ?

React Router v7 stands out in how it approaches form handling. With the integration of Remix, this model is now built directly into React Router itself. Many modern frameworks replace native form behavior with JavaScript-driven submission flows, but React Router v7 leans into progressive enhancement by supporting forms that work even when JavaScript is unavailable.

### More great articles from LogRocket:

- Don't miss a moment with [The Replay](https://lp.logrocket.com/subscribe-thereplay), a curated newsletter from LogRocket

[Learn](https://blog.logrocket.com/rethinking-error-tracking-product-analytics/) how LogRocket's Galileo AI watches sessions for you and proactively surfaces the highest-impact things you should work on

- Use React's useEffect [to optimize your application's performance](https://blog.logrocket.com/understanding-react-useeffect-cleanup-function/)

- Switch between [multiple versions of Node](https://blog.logrocket.com/switching-between-node-versions-during-development/)

- [Discover ](https://blog.logrocket.com/using-react-children-prop-with-typescript/) how to use the React children prop with TypeScript

- [Explore](https://blog.logrocket.com/creating-custom-mouse-cursor-css/) creating a custom mouse cursor with CSS

- Advisory boards aren’t just for executives. [Join LogRocket’s Content Advisory Board.](https://lp.logrocket.com/blg/content-advisory-board-signup) You’ll help inform the type of content we create and get access to exclusive meetups, social accreditation, and swag

For developers who have been building web applications for a while, this approach may feel familiar, forms that look like this:

<form method="post" action="/user/new">
  <input type="text" name="username">
  <input type="password" name="password">
  <input type="submit" value="new user">
</form>

Both the request method and the place where we made the request were entirely defined in the form, so there’s no need for `onSubmit` handlers or `preventDefault`. React Router v7 has a custom `Form` component that embraces the feel of this type of experience.

Below is a sample component illustrating the `Form` component in action:

import { Form, redirect } from "react-router";

// Note the "action" export name, this will handle our form POST
export async function action({ request }) {
  const formData = await request.formData();
  const project = await createProject(formData);
  return redirect(`/projects/${project.id}`);
}

export default function NewProject() {
  return (
    <Form method="post">
      <p>
        <label>
          Name: <input name="name" type="text" />
        </label>
      </p>
      <p>
        <label>
          Description:
          <br />
          <textarea name="description" />
        </label>
      </p>
      <p>
        <button type="submit">Create</button>
      </p>
    </Form>
  );
}

When the form is submitted, it will make a `POST` request to the current route. The form will use that exported action function for handling, then redirect to the proper route. What’s old is new again!

## Conclusion

If you’re looking to recapture some of the old-school, full-stack web application feel while still benefiting from React on the client where it makes sense, React Router v7 is a compelling option. With the addition of static site generation support, it now fits a broader range of use cases, including blogs and marketing sites.

More broadly, much of the real innovation in frontend development today is happening in meta-frameworks, such as React Router v7, Next.js, SvelteKit, Nuxt.js, Gatsby, SolidStart, and Gridsome – which continue to shape how modern web applications are built.

            

            
            
        [#nextjs](https://blog.logrocket.com/tag/nextjs/)
        
            
        [#remix](https://blog.logrocket.com/tag/remix/)
        
            
        [#svelte](https://blog.logrocket.com/tag/svelte/)
        
    
            
            
        
    

    
    

  ![](https://blog.logrocket.com/wp-content/uploads/2022/06/footer-cta-dots-left.png)
    ![](https://blog.logrocket.com/wp-content/uploads/2022/06/footer-cta-dots-right.png)
  
    ![](https://blog.logrocket.com/wp-content/uploads/2022/09/logrocket-logo-frontend-analytics.png)
  
  
  
## Stop guessing about your digital experience with LogRocket

  [Get started for free](https://lp.logrocket.com/blg/signup)
  

        
        
    
    Recent posts:    
    
    
    
        
            ![](https://blog.logrocket.com/wp-content/uploads/2026/02/llm-routing-decisions-logrocket.png?w=420)
            
#### LLM routing in production: Choosing the right model for every request

        
                
Learn how LLM routing works in production, when it’s worth the complexity, and how teams choose the right model for each request.

    
    
        
            ![](https://blog.logrocket.com/wp-content/uploads/2022/10/IMG_20220809_120947-e1666638768500.jpg?w=150&h=150&crop=1)        
        [Alexander Godwin](https://blog.logrocket.com/author/alexandergodwin/)
        Feb 5, 2026 ⋅ 11 min read
    

    
        
            ![](https://blog.logrocket.com/wp-content/uploads/2026/02/The-Replay-Graphic-15.png?w=420)
            
#### The Replay (2/4/26): AI-first leadership, Tailwind layoffs, and more

        
                
Discover what&#8217;s new in The Replay, LogRocket&#8217;s newsletter for dev and engineering leaders, in the February 4th issue.

    
    
        
            ![](https://secure.gravatar.com/avatar/bdb8fc1c58c8a14e8c52f80c0ff964372237e773db8d0d1a179151099f28c358?s=50&#038;d=mm&#038;r=g)        
        [Matt MacCormack](https://blog.logrocket.com/author/matthewmaccormack/)
        Feb 4, 2026 ⋅ 37 sec read
    

    
        
            ![](https://blog.logrocket.com/wp-content/uploads/2026/01/2.4-Ken-Pickering-AI-First-Leadership.png?w=420)
            
#### What it actually means to be an AI-first engineering organization

        
                
AI-first isn’t about tools; it’s about how teams think, build, and decide. Ken Pickering, CTO at Scripta Insights, shares how engineering leaders can adapt.

    
    
        
            ![](https://blog.logrocket.com/wp-content/uploads/2026/01/ken_pickering.jpeg?w=150&h=150&crop=1)        
        [Ken Pickering](https://blog.logrocket.com/author/ken_pickering/)
        Feb 4, 2026 ⋅ 3 min read
    

    
        
            ![](https://blog.logrocket.com/wp-content/uploads/2026/02/llm-routing-decisions-logrocket-1.png?w=420)
            
#### How to build agentic frontend applications with CopilotKit

        
                
Build context-aware, agentic frontend applications by connecting React state and actions to LLMs with CopilotKit.

    
    
        
            ![](https://blog.logrocket.com/wp-content/uploads/2021/01/AirBrush_20210107121828.jpg?w=150&h=150&crop=1)        
        [Emmanuel John](https://blog.logrocket.com/author/emmanueljohn/)
        Feb 3, 2026 ⋅ 5 min read
    

    
        

    
    
        [View all posts](https://blog.logrocket.com/)
    
    
    
                
            2 Replies to "Remix vs. Next.js vs. SvelteKit"