# Reactive state management with JavaScript Signals

Home
							
							
						
							
								Software Development
							
							
						
							
								Programming Languages
							
							
						
							
								JavaScript
							
							
								

		
				
			
				
			
			
				![](https://www.infoworld.com/wp-content/uploads/2026/02/2019-0-33914800-1771491836-author_photo_Matthew-Tyson_1750190297.png?w=150)			
		
		
					
				by									[Matthew Tyson](https://www.infoworld.com/profile/matthew-tyson/)
							
		
					
									Contributing Writer
								
								
							
			

			
					
			
				
										
						
							**
						
					
						
							**
						
					
						
							**
						
					
						
							**
						
					
						
							**
						
					
						
							**
						
					
						
							**
						
									
			
		
				
		
			
				
# Reactive state management with JavaScript Signals

					feature
					Feb 12, 20269 mins		
			
				
					
					
					  **
					
				  
					
					  **
					
				  
					
					  **
					
				  
					
					  **
					
				  
					
					  **
					
				  
					
					  **
					
				  
					
					  **
					
				  				
			
		
					
		
	

		
			
				
								
				
					
							
						
				
			
						
				
					
							
						
				
			
						
				
					
							
						
				
			
						
				
					
							
						
				
			
						
				
					
							
						
				
			
						
				
					
							
						
				
			
						
				
					
							
						
				
			
							
						
			
				
						
					
			
		
					
		
		
	
		
			
				
					
						
							
								
											
			
				Learn how frameworks like Solid, Svelte, and Angular are using the Signals pattern to deliver reactive state without the weight.			
			

		
					
				
					
						![](https://www.infoworld.com/wp-content/uploads/2026/02/4129648-0-82142300-1770886918-marcel-ardivan-wU089-5b5pc-unsplash.jpg?quality=50&strip=all&w=1024)					
					
					
											
							Credit: 															[Marcel Ardivan](https://unsplash.com/@worldsofmaru)
													
									
			
											
							
											
						

					  
						

Signals is a simple idea with massive power. In one fell swoop, Signals provides reactivity while keeping state simple, even in large applications. That&rsquo;s why the Signals pattern has been adopted for inclusion in [Solid](https://www.infoworld.com/article/2271109/hands-on-with-the-solid-javascript-framework.html), [Svelte](https://www.infoworld.com/article/2265950/hands-on-with-svelte.html), and [Angular](https://www.infoworld.com/article/2252872/get-started-with-angular-introducing-the-modern-reactive-workflow.html). 

This article introduces Signals and demonstrates its fresh approach to state management, bringing new life to the JavaScript front end.

## Introducing the Signals pattern

The Signals pattern was first introduced in JavaScript&rsquo;s [Knockout framework](https://knockoutjs.com/). The basic idea is that a value alerts the rest of the application when it changes. Instead of a component checking its data every time it renders (as in [React](https://www.infoworld.com/article/2253289/react-tutorial-get-started-with-the-reactjs-javascript-library.html)&lsquo;s pull model), a signal &ldquo;pushes&rdquo; the update to exactly where it is needed.

							
							
							
										
											 							
												
							                                        
								                                    
									
								                                        
							
							
											
										
									
							
								
									

This is a pure expression of [reactivity](https://www.infoworld.com/article/2338730/what-is-reactive-programming-programming-with-event-streams.html), sometimes called &ldquo;fine-grained&rdquo; reactivity. It is almost magical how individual signals can update the output of a value without requiring any intervention from the developer.

		

	
	

			

The &ldquo;magic&rdquo; is really just an application of [functional programming](https://www.infoworld.com/article/3820034/intro-to-elixir-a-fresh-take-on-functional-programming.html), but it has big benefits for an application architecture. The Signals pattern eliminates the need for complex rendering checks in the framework engine. Even more importantly, it can simplify state management by providing a universal mechanism that can be used anywhere, even across components, eliminating the need for centralized stores.

## Before Signals: The virtual DOM

To understand why signals are such a breath of fresh air, we can start by looking at the dominant model of the last decade: The Virtual DOM (VDOM), popularized by React.

							
							
							
										
											 							
												
							                                        
								                                    
									
								                                        
							
							
											
										
									
							
								
									

The VDOM is an abstract DOM that holds a version in memory. When application state changes, the framework re-renders the component tree in memory, compares it to the previous version (a process called *diffing*), then updates the actual DOM with the differences.

While this makes UI development declarative and predictable, it introduces a cost. The framework does significant work just to determine what hasn&rsquo;t changed. This is compounded by data-heavy components like lists and trees. And, as applications grow larger, this diffing overhead adds up. Developers then resort to complex optimization techniques (like [memoization](https://react.dev/reference/react/memo)) in an effort to keep the engine from overworking.

## Fine-grained reactivity

State management via VDOM implies repeatedly walking a tree data structure in memory. Signals side-steps this entirely. By using a dependency graph, Signals changes the unit of reactivity. In a VDOM world, the unit is the component, whereas with Signals, the unit is the value itself.

							
							
							
										
											 							
												
							                                        
								                                    
									
								                                        
							
							
											
										
									
							
								
									

Signals is essentially an observer pattern where the observers are automatically enrolled. When a view template reads an individual signal, it automatically subscribes to it. This creates a simple, direct link between the data and the specific text node or attribute that displays it. When the signal changes, it notifies only those exact subscribers.

This is a point-to-point update. The framework doesn&rsquo;t need to walk a component tree or determine what changed. This shifts the performance characteristic from O(n) (where *n* is tree size) to O(1) (immediate, direct update).

### State management in React

The React team has taken a different approach to optimizing state mangement, with the [React Compiler](https://www.infoworld.com/article/3583477/is-the-react-compiler-ready-for-prime-time.html). The built-in compiler automatically applies performance techniques without the developer&rsquo;s intervention.

## Hands-on with Signals

The best way to understand the benefits of Signals is to see the pattern in action. When developing application components, the difference between using Signals and a more traditional VDOM approach is, at first, almost invisible. Here&rsquo;s React handling a simple state instance:

							
							
							
										
											 							
												
							                                        
								                                    
									
								                                        
							
							
											
										
									
							
								
									

function Counter() {
  const [count, setCount] = useState(0);
  const double = count * 2;

  return (
    <button onClick={() => setCount(count + 1)}>
      {count} doubled is {double}
    </button>
  );
}

Now consider the same idea in Svelte using individual signals with the [Runes syntax](https://www.infoworld.com/article/2336000/reactive-magic-in-svelte-5-understanding-runes.html):

<script>
  let count = $state(0);
  let double = $derived(count * 2);
</script>

<button onclick={() => count += 1}>
  {count} doubled is {double}
</button>

In both cases, you have a reactive value (`count`) and a value that is dependent on it (`double`). They both do the same thing. To see the difference, you can add a console log to them. Here&rsquo;s the log with React:

export default function Counter() {
  const [count, setCount] = useState(0);
  const double = count * 2;

  console.log("Re-evaluating the world...");

  return (
    <button onClick={() => setCount(count + 1)}>
      Count is {count}, double is {double}
    </button>
  );
}

Every time the component mounts, *or updates*, the console will output this line of logging. But now look at the same log from Svelte:

							
							
							
										
											 							
												
							                                        
								                                    
									
								                                        
							
							
											
										
									
							
								
									

<script>
  let count = $state(0);
  let double = $derived(count * 2);

  console.log("One and done.");
</script>

<button onclick={() => count += 1}>
  Count is {count}, double is {double}
</button>

In this case, the console logging happens *only once*, when the component mounts.

At first, this seems impossible. But the trick is, the signal just directly connects the value to its output, with no need to invoke the surrounding JavaScript that created it. The component does not need to be re-evaluated. The signal is a portable unit of reactivity.

## How Signals eliminates dependent values

Another important result of using signals is how we manage side-effects. In React, we have to declare the dependent values. These are the parameters we pass to `useEffect`. This is a common area of complaint in terms of developer experience (DX) because it is an additional relationship to manage. Over time, this can lead to mistakes (like forgetting to add a value) and may otherwise impact performance. As an example, consider what happens when there are many values:

							
							
							
										
											 							
												
							                                        
								                                    
									
								                                        
							
							
											
										
									
							
								
									

useEffect(() => {
  console.log(`The count is now ${count}`);
}, [count]);

Passing the same job with signals eliminates the dependent values:

effect(() => {
  console.log(`The count is now ${count()}`);
});

In this case, we&rsquo;ve used Angular syntax, but it&rsquo;s similar across other frameworks that use signals. Here&rsquo;s the same example with Solid:

createEffect(() => {
  console.log(count());
});

## The end of &lsquo;prop drilling&rsquo;

Using the Signals pattern for state management also impacts application design. We can see it most readily in the way we have to pass properties down the component tree, from parent to child, when we need to share state:

							
							
							
										
											 							
												
							                                        
								                                    
									
								                                        
							
							
											
										
									
							
								
									

// In React, sharing state can mean passing it down...
function Parent() {
  const [count, setCount] = useState(0);
  return <Child count={count} />;
}

function Child({ count }) {
  // ...and down again...
  return <GrandChild count={count} />;
}

function GrandChild({ count }) {
  // ...until it finally reaches the destination.
  return <div>{count}</div>;
}

The impact will also show up in centralized stores like [Redux](https://redux.js.org/), which strive to reduce complexity sprawl but often seem to add to the problem. Signals eliminates both issues by making a centralized state simply another JavaScript file you create and import in the components. For example, here&rsquo;s how a shared state module might look in Svelte:

// store.svelte.js
// This state exists independently of the UI tree.
export const counter = $state({
  value: 0
});

// We can even put shared functions in here
export function increment() {
  counter.value += 1;
}

Using this is just normal JavaScript:

<script>
  import { increment } from './store.svelte.js';
</script>

<button onclick={increment}>
  Click Me
</button>

## 
Toward a Signals standard?

Historically, successful patterns that start out in libraries or individual frameworks often migrate into the language. Just think of how jQuery&rsquo;s selectors influenced document.querySelector, or how Promises became part of the JavaScript standard.

							
							
							
										
											 							
												
							                                        
								                                    
									
								                                        
							
							
											
										
									
							
								
									

Now, we are seeing it happen again with Signals. There is currently a [proposal](https://github.com/tc39/proposal-signals) (TC39) to add signals directly to JavaScript. The goal isn&rsquo;t to replace how frameworks work, but to provide a standard format for reactivity, which frameworks can then adopt.

Imagine defining a signal in a vanilla JavaScript file and having it drive a React component, a Svelte template, and an Angular service simultaneously. If adopted, this would move state management from a framework concern to a language concern&mdash;a big win for simplicity. Of course, it&rsquo;s only a win if it goes well and doesn&rsquo;t [just spawn another way to do things](https://xkcd.com/927/).

## Conclusion

For a long time, JavaScript developers have accepted a tradeoff in front-end development, exchanging the raw performance of direct DOM manipulation for the declarative ease of the Virtual DOM. We accepted the overhead because it made applications easier to manage.

							
							
							
										
											 							
												
							                                        
								                                    
									
								                                        
							
							
											
										
									
							
								
									

Signals offers a way to grow beyond that compromise. While the roots of the pattern go back to the early days of the web, credit is due to [Ryan Carniato](https://www.infoworld.com/article/2267784/solidjs-creator-javascript-innovation-isnt-slowing-down.html) and [Solid.js](https://www.solidjs.com/) for proving that fine-grained reactivity could outperform the VDOM in the modern era. Their success sparked a movement that has now spread to Angular, Svelte, and possibly the JavaScript language itself.

Signals gives JavaScript developers a declarative experience by defining state and letting the UI react to it, but with the surgical performance of direct updates. Returning to a push model, versus the pull model we&rsquo;ve come to accept, lets us do more with less code. And with that, it may be the quest for simplicity in JavaScript is finally gaining traction.

					  
						[JavaScript](https://www.infoworld.com/javascript/)[Programming Languages](https://www.infoworld.com/programming-languages/)[Software Development](https://www.infoworld.com/software-development/)					
				
			

			
			
				
					
        
					
					  
						
											
						
					  
					
						  		
			
## Related content
			
									
		
			
				
					news									
				
### Abandoned project linking Java, JavaScript makes a comeback
				By Paul Krill				
					Feb 25, 2026					2 mins				
				
																		
								Java							
													
								JavaScript							
													
								Python							
															
			
		
								
		
			
				
					news									
				
### Inception’s Mercury 2 speeds around LLM latency bottlenecks
				By Paul Krill				
					Feb 25, 2026					2 mins				
				
																		
								Artificial Intelligence							
													
								Development Tools							
													
								Generative AI							
															
			
		
								
		
			
				
					feature									
				
### The best new features in MariaDB
				By Serdar Yegulalp				
					Feb 25, 2026					7 mins				
				
																		
								Databases							
													
								MySQL							
													
								Relational Databases							
															
			
		
								
		
			
				
					opinion									
				
### Claude Code is blowing me away
				By Nick Hodges				
					Feb 25, 2026					5 mins				
				
																		
								Developer							
													
								Generative AI							
													
								Roles							
															
			
		
															
					
			
## Other Sections

			
										
							
								Resources							
						
												
							
								Videos							
						
									
		
					
		
        
					
					  
						
											
						
					  
					
						   			 
				
			
			

		
	

	
		
							
					
													
								
									![](https://www.infoworld.com/wp-content/uploads/2026/02/2019-0-33914800-1771491836-author_photo_Matthew-Tyson_1750190297.png?w=250)								
							
											

					
						
							
								
									
																					
																									
														by 															
																Matthew Tyson															
																											
												
																									
																													Contributing Writer
														
														
																											
																							
										
									
								

															
							
															
									
Matthew Tyson is a contributing writer at InfoWorld. A seasoned technology journalist and expert in enterprise software development, Matthew has written about programming, programming languages, language frameworks, application platforms, development tools, databases, cryptography, information security, cloud computing, and emerging technologies such as blockchain and machine learning for more than 15 years. His work has appeared in leading publications including InfoWorld, CIO, CSO Online, and IBM developerWorks. Matthew also has had the privilege of interviewing many tech luminaries including Brendan Eich, Grady Booch, Guillermo Rauch, and Martin Hellman. 




Matthew’s diverse background encompasses full-stack development (Java, JVM languages such as Kotlin, JavaScript, Python, .NET), front-end development (Angular, React, Vue, Svelte) and back-end development (Spring Boot, Node.js, Django), software architecture, and IT infrastructure at companies ranging from startups to Fortune 500 enterprises. He is a trusted authority in critical technology areas such as database design (SQL and NoSQL), AI-assisted coding, agentic AI, open-source initiatives, enterprise integration, and cloud platforms, providing insightful analysis and practical guidance rooted in real-world experience. 

								
							
									
			
				
					
## More from this author

				
				
					
						
					
				
			
			
				
					feature
### WinterTC: Write once, run anywhere (for real this time)
 Feb 19, 2026 8 minsfeature
### Beyond NPM: What you need to know about JSR
 Feb 5, 2026 8 minsanalysis
### Are you ready for JavaScript in 2026?
 Jan 30, 2026 4 minshow-to
### Get started with Angular: Introducing the modern reactive workflow
 Jan 29, 2026 14 minsfeature
### TypeScript levels up with type stripping
 Jan 22, 2026 10 minshow-to
### React tutorial: Get started with the React JavaScript library
 Jan 15, 2026 12 minsanalysis
### Generative UI: The AI agent is the front end
 Jan 7, 2026 8 minsanalysis
### Back to the future: The most popular JavaScript stories and themes of 2025
 Jan 2, 2026 4 mins				
			

		
								
					
				
					

			

	

			
## Show me more
PopularArticlesVideos
		
					
						news  
### Microsoft warns of job‑themed repo lures targeting developers with multi‑stage backdoors
 By Shweta SharmaFeb 25, 20263 mins
				 CareersDeveloperMalware
					![](https://www.infoworld.com/wp-content/uploads/2026/02/4137197-0-03587500-1772025943-shutterstock_1727257906.jpg?quality=50&#038;strip=all&#038;w=375)
				
			
					
						news  
### JDK 26: The new features in Java 26
 By Paul KrillFeb 24, 20267 mins
				 JavaProgramming LanguagesSoftware Development
					![](https://www.infoworld.com/wp-content/uploads/2026/02/4050993-0-25106500-1771982032-shutterstock_2586524903.jpg?quality=50&#038;strip=all&#038;w=375)
				
			
					
						news  
### Google adds AI agent to Opal mini-app builder
 By Paul KrillFeb 24, 20262 mins
				 Artificial IntelligenceDevelopment ToolsGenerative AI
					![](https://www.infoworld.com/wp-content/uploads/2026/02/4136919-0-39896400-1771981431-shutterstock_724340023.jpg?quality=50&#038;strip=all&#038;w=375)
				
			
					
						video  
### Run PostgreSQL in Python — No Setup Required
 Feb 4, 20264 mins
				 Python
					![](https://www.infoworld.com/wp-content/uploads/2026/02/4127484-0-21193400-1770231006-youtube-thumbnail-zgjiYAmA0Zw_1a79ce.jpg?quality=50&#038;strip=all&#038;w=444)
				
			
					
						video  
### Visual generative AI development with ComfyUI
 Jan 23, 20265 mins
				 Python
					![](https://www.infoworld.com/wp-content/uploads/2026/01/4121505-0-67299800-1769182062-youtube-thumbnail-HeFcBcSqtTM_338590.jpg?quality=50&#038;strip=all&#038;w=444)
				
			
					
						video  
### Why SQLite Finally Feels Modern
 Jan 14, 20264 mins
				 Python
					![](https://www.infoworld.com/wp-content/uploads/2026/01/4116894-0-01143100-1768416537-youtube-thumbnail-AC2CnaJs7Mg_334e3f.jpg?quality=50&#038;strip=all&#038;w=444)