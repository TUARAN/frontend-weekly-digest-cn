# Shadcn UI adoption guide: Overview, examples, and alternatives

# Shadcn UI adoption guide: Overview, examples, and alternatives

    
        
            ![](https://blog.logrocket.com/wp-content/uploads/2020/12/nefe-james.jpeg?w=150&h=150&crop=1)        
        
            [Nefe Emadamerho-Atori](https://blog.logrocket.com/author/nefejames/)
            Nefe is a frontend developer who enjoys learning new things and sharing his knowledge with others.
        
    

    
        
            
                                

            
            
                Table of contents            
            **
            **
        
        
    
        [**What is Shadcn UI?**](https://blog.logrocket.com/shadcn-ui-adoption-guide/#what-is-shadcn-ui)
        

        
        [**Pros and cons of Shadcn UI**](https://blog.logrocket.com/shadcn-ui-adoption-guide/#pros-and-cons-of-shadcn-ui)
        

        
        [**Getting started with Shadcn UI**](https://blog.logrocket.com/shadcn-ui-adoption-guide/#getting-started-with-shadcn-ui)
        

        
        [**Shadcn UI features**](https://blog.logrocket.com/shadcn-ui-adoption-guide/#shadcn-ui-features)
            
        [**Themes, theme editor, and light/dark modes**](https://blog.logrocket.com/shadcn-ui-adoption-guide/#themes-theme-editor-and-light-dark-modes)
        

        
        [**Open in v0**](https://blog.logrocket.com/shadcn-ui-adoption-guide/#open-in-v0)
        

        
        [**Blocks (templates) and Lift mode**](https://blog.logrocket.com/shadcn-ui-adoption-guide/#blocks-templates-and-lift-mode)
        

        
        [**Shadcn Create**](https://blog.logrocket.com/shadcn-ui-adoption-guide/#shadcn-create)
        

    
        
        [**Creating a login form with Shadcn UI**](https://blog.logrocket.com/shadcn-ui-adoption-guide/#creating-a-login-form-with-shadcn-ui)
        

        
        [**Use cases for Shadcn UI**](https://blog.logrocket.com/shadcn-ui-adoption-guide/#use-cases-for-shadcn-ui)
        

        
        [**Shadcn UI vs. other UI and component libraries**](https://blog.logrocket.com/shadcn-ui-adoption-guide/#shadcn-ui-vs-other-ui-and-component-libraries)
        

        
        [**Conclusion**](https://blog.logrocket.com/shadcn-ui-adoption-guide/#conclusion)
        

    
    
                
    
        ![](https://blog.logrocket.com/wp-content/uploads/2023/12/GalileoAIPreview.png)
    
    Introducing Galileo AI
    LogRocket’s Galileo AI watches every session, surfacing impactful user struggle and key behavior patterns.
    
        [LEARN MORE](https://logrocket.com/products/galileo-ai)
    

            
        
        

    
        ![](https://blog.logrocket.com/wp-content/uploads/2023/04/logrocket-logo-1.png)
        
            
## See how LogRocket's Galileo AI surfaces the most severe issues for you

            
### No signup required

        
        Check it out
    
    
        
            
            
        
    




            

    
    
    

***Editor’s note:** This article was reviewed and updated by [Elijah Asoula](https://blog.logrocket.com/author/asaoluelijah/) in February 2026 to improve technical accuracy and reflect recent updates to the Shadcn UI ecosystem. Updates include coverage of Shadcn Create, blocks and Lift mode, revised use cases, and updated comparisons with other UI and component libraries.*
![](https://blog.logrocket.com/wp-content/uploads/2023/11/Shadcn-UI-adoption-guide.png)

Shadcn UI takes a different approach from traditional component libraries like Material UI and Chakra UI. Instead of importing pre-packaged components, Shadcn UI lets you copy the source code for individual components directly into your codebase.

In this guide, we’ll explore what makes Shadcn UI so popular among developers and build some UI interfaces along the way.


    
    
### 🚀 Sign up for The Replay newsletter

    
[ **The Replay**](https://blog.logrocket.com/the-replay-archive/)  is a weekly newsletter for dev and engineering leaders.

    
Delivered once a week, it's your curated guide to the most important conversations around frontend dev, emerging AI tools, and the state of modern software.

    
	Notice: JavaScript is required for this content.

    

        
        
        





## **What is Shadcn UI?**

Shadcn UI is not a component library or UI framework. It’s “a collection of reusable components that we can copy and paste into our apps.” This reusable component collection was created by Shadcn, who has also created great open source projects like Taxonomy, Next.js for Drupal, and Reflexjs.

Shadcn UI is built on top of Tailwind CSS and allows you to choose between Radix UI or Base UI as the underlying primitive. It currently supports Next.js, Remix, Astro, Laravel, and Vite. However, there is an official guide for manually integrating it with other technologies.

Shadcn UI was released in March 2023 and quickly became one of the most viral UI solutions in the web development ecosystem. As of this writing, it has over 105k stars on GitHub. The impact of the library has been so great that its creator later joined Vercel, where Shadcn UI is now used and promoted within tools like v0.

## **Pros and cons of Shadcn UI**

If you’ve been looking for a more flexible, developer-friendly UI toolkit, Shadcn UI checks a lot of boxes. Here are the key advantages.

- **Offers beautifully designed components:** One of Shadcn UI’s biggest strengths is its design quality. The components look polished out of the box, so it’s easy to build an interface that feels modern and intentional without a lot of extra styling work

- **Provides many components:** Shadcn UI offers various component options, ranging from basic UI elements like buttons and inputs to more complex components like toasts, dropdown menus, and navigation menus. This gives you a wide range of building blocks for your app

- **Ease of use:** Anyone with basic knowledge of HTML, CSS, JavaScript, and a framework or two can quickly get started with Shadcn UI. Its components are easily accessed using either the copy and paste or the CLI installation method.

- **Built with Tailwind CSS:** Shadcn uses Tailwind CSS, a popular and utility-first CSS framework, for styling. This allows you to easily customize the components to match your application’s branding and design requirements

- **Accessibility:** Shadcn UI’s components are compliant with the Web Content Accessibility Guidelines (WCAG). It supports screen readers, keyboard navigation, and other accessibility features. You can use Shadcn UI to create applications that are both beautiful and accessible to all users

- **Fine-grained control and extensibility:** Shadcn UI provides direct access to each component’s source code, so you can easily adjust the code to fit unique use cases and application needs. This ease of customization helps Shadcn UI stand out among other UI solutions and makes it a delight to work with.

That said, Shadcn UI isn’t the right fit for every project. Here are some tradeoffs to consider:

- **Manual installation of components:** Manually installing or copying every component you need can be a hassle. This extra step is not a big issue, but it can add more stress to the developer experience, particularly for those who are used to importing components from a package

- **Larger codebase:** Second, while having direct access to components’ code is beneficial in terms of modularity and extensibility, it also results in a larger codebase that requires more maintenance

- **Bundling and performance:** Any component you use will be included in your application’s bundle. This can increase the overall bundle size and affect performance. You’ll have to manually use performance optimization techniques like code splitting to optimize the bundle size, which requires extra effort

- **Requires Tailwind CSS knowledge:** While it’s not a major issue, knowledge of Tailwind CSS is required to effectively use Shadcn UI

Ultimately, Shadcn UI trades convenience for control. If that aligns with how you like to work, it’s worth exploring. If not, that’s valuable to know upfront.

## **Getting started with Shadcn UI**

While Shadcn UI integrates with multiple frameworks like Vite, Remix, Astro, and Laravel, we’ll walk through the Next.js setup here. Refer to the installation guide for instructions on integrating with other frameworks.

To get started, create a new Next.js application by running the command below:

npx create-next-app@latest my-app --typescript --tailwind --eslint

Next, run the `init` command to initialize dependencies for a new project:

npx shadcn@latest init

The CLI will prompt you to make some configurations. Here’s a sample of the configuration questions:

Would you like to use TypeScript (recommended)? no / yes
Which style would you like to use? › Default
Which color would you like to use as base color? › Slate
Where is your global CSS file? › › app/globals.css
Do you want to use CSS variables for colors? › no / yes
Where is your tailwind.config.js located? › tailwind.config.js
Configure the import alias for components: › @/components
Configure the import alias for utils: › @/lib/utils
Are you using React Server Components? › no / yes

That’s it! Now you can start adding components to your applications using the `add` command as shown below:

npx shadcn@latest add [component]

For example, to add a button component to your application, run the following command:

npx shadcn@latest add button

Next, import the Button component into your application and specify the variant you want to use:

import { Button } from "@/components/ui/button"

<Button variant="outline">Button</Button>

You can then customize the button’s styles and behavior directly in your codebase.

## **Shadcn UI features**

Shadcn UI provides several features that you can leverage to enhance the development experience. Let’s take a closer look at features like its themes and theme editor, CLI, multiple components, and more.

### **Themes, theme editor, and light/dark modes**

Shadcn UI provides hand-picked themes that you can copy and paste into your applications. You can manually add theme tokens through the codebase, but you can also achieve the same results using Shadcn UI’s theme editor.

The theme editor’s interface allows you to configure themes for properties such as color, border radius, and light or dark mode. You can also choose between two styles: `default` and `new-york`. The styles have unique components, animations, icons, and more.

The `default` style has larger input fields and uses lucide-react icons and tailwindcss-animate for animations. The `new-york` style has smaller buttons, cards with shadows, and uses Radix Icons.

You can also easily create custom themes via Shadcn UI’s graphical interface. The editor outputs a piece of code containing your custom style definitions. Then, you ju copy the code and paste it into your application:

![](https://blog.logrocket.com/wp-content/uploads/2024/05/Demo-Of-Using-Shadcn-Ui-Graphical-Interface-To-Customize-An-App-Theme.gif)Using Shadcn UI’s graphical interface to customize an app theme

Here’s a sample of the theme editor’s code output. It provides style tokens for both light mode and dark mode:

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.3rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

Shadcn UI supports dark mode for Next.js and Vite applications. For Next.js applications, Shadcn UI uses next-themes for the dark mode toggling functionality. When a user toggles between light and dark mode, the application switches between the light and dark theme tokens.

### **Open in v0**

v0 is Vercel’s generative AI tool for building UI components using natural language prompts. It generates production-ready React code powered by Shadcn UI and Tailwind CSS. The Open in v0 feature integrates Shadcn UI directly with v0, allowing you to open an existing Shadcn UI component inside the v0 interface.

From there, you can use AI prompts to modify the component’s layout, styles, or structure, and then copy the updated code back into your application. A v0 account is required to use this feature. You can access Open in v0 from the documentation page of any Shadcn UI component.

### **Blocks (templates) and Lift mode**

Blocks are prebuilt, page-level templates composed of multiple Shadcn UI components and layouts. Instead of assembling individual components like buttons, inputs, and forms yourself, you can add a complete block, such as a form or dashboard layout, and then customize it in your codebase. Each block is fully responsive and designed to work across desktop, tablet, and mobile screen sizes.

Integrating a block is straightforward. You simply select the block you want from the blocks page, then run the Shadcn UI CLI command for that block to add it to your project, as shown below.

![](https://blog.logrocket.com/wp-content/uploads/2024/05/Blocks-and-Lift-mode-in-Shadcn.gif)Blocks and Lift mode in Shadcn

Lift mode also extends the usefulness of blocks by allowing you to extract individual components from a block. With Lift mode enabled, you can copy the code for smaller building blocks, such as cards, buttons, or form sections, without adding the entire template. This gives you more flexibility when reusing block content.

### **Shadcn Create**

One of the most common criticisms of Shadcn UI was visual sameness. Many apps looked alike out of the box. In response, the team released Shadcn Create in late 2025, which flips the script: instead of starting generic and customizing later, you begin with a design preset that reflects your app’s personality.

Choose your colors, spacing, fonts, and icons upfront, and Shadcn Create generates a project with those preferences already configured in your theme. It’s a faster, more intentional way to build something that feels unique from line one.

Start by visiting the Create dashboard and choosing a design preset that matches the look and feel you want for your application, as shown below.

![](https://blog.logrocket.com/wp-content/uploads/2024/05/Interacting-with-the-Shadcn-create-playground.gif)Interacting with the Shadcn create playground

Each preset defines a different visual identity, including spacing, border radius, typography, color usage, and icon choices. You can further customize options such as base color, font, icons, and radius to better match your design preferences.

Once you’re satisfied with your selections, click the Create button at the top right corner of the page.

![](https://blog.logrocket.com/wp-content/uploads/2024/05/The-create-button.jpeg)

You’ll then be prompted to select the framework you’re using. Shadcn Create generates a framework-specific installation command tailored to your chosen preset and configuration.

![](https://blog.logrocket.com/wp-content/uploads/2024/05/Running-a-command-on-Shadcn.jpeg)

Running this command sets up your project with the selected design defaults already applied, giving you a customized starting point before you add components or blocks.

## **Creating a login form with Shadcn UI**

When it comes to forms, Shadcn UI goes beyond offering form components like `Input`, `Textarea`, `Checkbox`, and `RadioGroup`. It also provides a `Form` component, which is a wrapper around react-hook-form.

Here are some of the things the `Form` component provides:

- A `<FormField />` component for building controlled form fields

- Support for validation with form validation libraries like Valibot, Yup, and Zod

- Error message handling

You can access the component by running the command below:

npx shadcn@latest add form input

Next, set up the components for the form, like so:

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

export function ComponentExample() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
  }

  return (
    <div className="max-w-4xl flex items-center justify-center min-h-screen">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-2/3 space-y-6"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Input username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}

Here’s the online form built with the above code:

![](https://blog.logrocket.com/wp-content/uploads/2024/05/Example-Of-An-Online-Form-Built-With-Shadcn-Ui-With-A-Username-Label-Over-An-Input-Field-Over-A-Button.gif)

## **Use cases for Shadcn UI**

While this isn’t an exhaustive list, Shadcn UI works particularly well for the following use cases:

- Building visually polished websites and applications: Shadcn UI ships with thoughtfully designed components that help you create clean, modern interfaces without spending excessive time on visual styling

- Rapid prototyping and product development: By providing ready-made, customizable components, Shadcn UI allows you to move quickly from idea to implementation and focus on core product features

- Building component libraries and design systems: Because the components live directly in your codebase and are easy to customize, Shadcn UI is well-suited for teams building internal component libraries or design systems that need full control over styling and behavior

In all of these cases, Shadcn UI offers a flexible foundation that adapts well to different project requirements.

## **Shadcn UI vs. other UI and component libraries**

While Shadcn UI has quickly become a top choice for building websites and applications, it’s not the only option available. The table below gives a breakdown of how Shadcn UI compares against other component libraries:

Shadcn UI
Material UI (MUI)
Chakra UI
Ant Design

GitHub stars
105k
97k
40k
97k

Framework support
React, but there are Shadcn UI versions for other frameworks
React, but there are MUI versions for other frameworks
React, but there are Chakra UI versions for Vue and Svelte
React, but there is a Vue version of Ant Design

Bundle size (minified + gzipped)
Depends on usage
93.7 kb
89 kb
429 kb

Maturity
Young and fast-growing library
Established library
Young and fast growing library
Established library

Best suited for
Small to large scale projects with custom UI needs
Small and large scale projects
Small to large scale projects
Small to large scale projects

Design system
User-defined
Google’s Material Design
Chakra’s design system
Ant Design system

Figma UI kit
No
Yes
Yes
Yes

## **Conclusion**

Shadcn UI flips the traditional component library model. Instead of installing a package, you copy the code directly into your project. That gives you complete ownership and makes customization straightforward, without slowing you down.

Shadcn UI is now a proven option for a wide range of projects, from small apps to large production systems. Its use within the React and Next.js ecosystem, including tools like Vercel’s v0, shows that it has reached a level of maturity and stability. For teams that value flexibility and control over their UI code, Shadcn UI is a solid choice.

LogRocket understands everything users do in your web and mobile apps.

[![](https://blog.logrocket.com/wp-content/uploads/2017/03/1d0cd-1s_rmyo6nbrasp-xtvbaxfg.png)](https://lp.logrocket.com/blg/typescript-signup)

[LogRocket](https://lp.logrocket.com/blg/typescript-signup) lets you replay user sessions, eliminating guesswork by showing exactly what users experienced. It captures console logs, errors, network requests, and pixel-perfect DOM recordings — compatible with all frameworks, and with plugins to log additional context from Redux, Vuex, and @ngrx/store.

With Galileo AI, you can instantly identify and explain user struggles with automated monitoring of your entire product experience.

Modernize how you understand your web and mobile apps — [start monitoring for free](https://lp.logrocket.com/blg/typescript-signup).

            

            
            
        [#adoption guide](https://blog.logrocket.com/tag/adoption-guide/)
        
            
        [#typescript](https://blog.logrocket.com/tag/typescript/)
        
    
            
            
        
    

    
    

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
    

    
        
            ![](https://blog.logrocket.com/wp-content/uploads/2021/12/react-svelte-next-js.png?w=420)
            
#### Remix vs. Next.js vs. SvelteKit

        
                
Compare key features of popular meta-frameworks Remix, Next.js, and SvelteKit, from project setup to styling.

    
    
        
            ![](https://blog.logrocket.com/wp-content/uploads/2021/07/7D1BB823-5BC3-40E9-AF0C-ABE25780213F.jpg?w=150&h=150&crop=1)        
        [Alex Merced](https://blog.logrocket.com/author/alexmerced/)
        Feb 4, 2026 ⋅ 8 min read
    

    
        
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
    

    
        

    
    
        [View all posts](https://blog.logrocket.com/)
    
    
    
                
            4 Replies to "Shadcn UI adoption guide: Overview, examples, and alternatives"