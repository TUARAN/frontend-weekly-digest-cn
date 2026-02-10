# Implementing the Temporal proposal in JavaScriptCore

![](https://blogs.igalia.com/compilers/img/clock.jpg)

# Implementing the Temporal proposal in JavaScriptCore

    - By Tim Chevalier,

	- 31 January 2026

	- [jsc](https://blogs.igalia.com/compilers/tags/jsc/)

	- [temporal](https://blogs.igalia.com/compilers/tags/temporal/)

	- [javascript](https://blogs.igalia.com/compilers/tags/javascript/)

*[Image source](https://www.publicdomainpictures.net/en/view-image.php?image=10690&picture=prague-astronomical-clock-detail)*

For the past year, I've been working on implementing the [Temporal](https://tc39.es/proposal-temporal/docs/) proposal for date and time handling in JavaScript, in JavaScriptCore (JSC). JavaScriptCore is the JavaScript engine that's part of the WebKit browser engine. When I started, Temporal was partially implemented, with support for the `Duration`, `PlainDate`, `PlainDateTime`, and `Instant` types. However, many [test262](https://github.com/tc39/test262) tests related to Temporal didn't pass, and there was no support for `PlainMonthDay`, `PlainYearMonth`, or `ZonedDateTime` objects. Further, there was no support for the `relativeTo` parameter, and only the "iso8601" calendar was supported.

## Duration precision (landed) [#](https://blogs.igalia.com/compilers/2026/01/31/implementing-the-temporal-proposal-in-javascriptcore/#duration-precision-landed)

Conceptually, a duration is a 10-tuple of time components, or a record with the fields "years", "months", "weeks", "days", "hours", "seconds", "milliseconds", "microseconds", and "nanoseconds".

One way durations are used is to represent the difference between two dates. For example, to find the length of time from a given date until the end of 2027, I could write the following JS code:

> const duration = (new Temporal.PlainDate(2026, 1, 26)).until(new Temporal.PlainDate(2027, 12, 31), { largestUnit: "years" })
> duration
Temporal.Duration <P1Y11M5D> {
  years: 1,
  months: 11,
  days: 5
}

The `until` method in this case returns a duration comprising one year, eleven months, and five days. Because durations can represent differences between dates, they can also be negative:

> const duration = (new Temporal.PlainDate(2027, 12, 31)).until(new Temporal.PlainDate(2026, 1, 26), { largestUnit: "years" })
> duration
Temporal.Duration <P1Y11M5D> {
  years: -1,
  months: -11,
  days: -5
}

When converted to nanoseconds, the total of days, hours, minutes, seconds, milliseconds, microseconds, and nanoseconds for a duration may be a number whose absolute value is as large as 109 × 253. This number is too large to represent either as a 32-bit integer or as a 64-bit double-precision value. (If you're wondering about the significance of the number 253, see the [MDN documentation on JavaScript's `MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER).)

To understand why we need to be able to work with such large numbers, consider totaling the number of nanoseconds in a duration.  Following on the previous example’s definition of the variable `duration`:

> duration.total({unit: "nanoseconds", relativeTo: new Temporal.PlainDate(2025, 12, 15)})
60912000000000000

There are 60912000000000000 nanoseconds, or about 6.1e16, in a period of one year, eleven months, and five days. Since we want to allow this computation to be done with any valid start and end date, and valid years in Temporal range from -271821 to 275760, the result can get quite large. (By default, Temporal follows the [ISO 8601 standard](https://en.wikipedia.org/wiki/ISO_8601) for calendars, which entails using a [proleptic Gregorian calendar](https://en.wikipedia.org/wiki/Proleptic_Gregorian_calendar). Also note that this example uses a `PlainDate`, which has no time zone, so computations are not affected by daylight savings time; when computing with the Temporal `ZonedDateTime` type, the specification ensures that time zone math is done properly.)

To make it easier for implementations to fulfill these requirements, the specification represents durations internally as [Internal Duration Records](https://tc39.es/proposal-temporal/#sec-temporal-internal-duration-records) and converts between JavaScript-level duration objects and Internal Duration Records (which I'll call "internal durations") as needed. An internal duration pairs the date component of the duration (the years, months, weeks, and days fields) with a "time duration", which is a single integer that falls within an accepted range, and can be as large as 253 × 109 - 1.

Implementations don't *have* to use this representation, as long as the results are observably the same as what the specification dictates. However, the pre-existing implementation didn't suffice, so I re-implemented durations in a way that closely follows the approach in the specification.

This work has been landed in JSC.

## New date types [#](https://blogs.igalia.com/compilers/2026/01/31/implementing-the-temporal-proposal-in-javascriptcore/#new-date-types)

Temporal's date types include `PlainDate`, `PlainDateTime`, `Instant`, `ZonedDateTime`, `PlainMonthDay`, and `PlainYearMonth`. The latter two represent partial dates: either a pair of a month and a day within that month, or a pair of a year and month within that year. Partial dates are a better solution for representing dates where not all of the fields are known (or not all of the fields matter) than full dates with default values for the missing bits.

Temporal's `ZonedDateTime` type represents a date along with a time zone, which can either be a numeric offset from UTC, or a named time zone.

I implemented `PlainMonthDay` and `PlainYearMonth` with all their operations. `ZonedDateTime` is fully implemented and the first pull request in a series of PRs for it has been submitted.

## The relativeTo parameter [#](https://blogs.igalia.com/compilers/2026/01/31/implementing-the-temporal-proposal-in-javascriptcore/#the-relativeto-parameter)

What if you want to convert a number of years to a number of days? Temporal can do that, but there's a catch. Converting years to days depends on what year it is, when using the ISO 8601 calendar (similar to the Gregorian calendar), because the calendar has leap years. Some calendars have leap months as well, so converting years to months would depend on what year it is as well. Likewise, converting months to days doesn't have a consistent answer, because months vary in length.

For that reason, the following code will throw an exception, because there's not enough information to compute the result:

> const duration = Temporal.Duration.from({ years: 1 })
> duration.total({ unit: "days" })
Uncaught RangeError: a starting point is required for years total

The above definition of `duration` can still be made to work if we pass in a starting point, which we can do using the `relativeTo` parameter:

> duration.total({ unit: "days", relativeTo: "2025-01-01" })
365
> duration.total({ unit: "days", relativeTo: "2024-01-01" })
366

The string passed in for the `relativeTo` parameter is automatically converted to either a `PlainDate` or a `ZonedDateTime`, depending on which format it conforms to.

I implemented support for the `relativeTo` parameter on all the operations that have it; once the implementations for all the date types land, I'll be submitting this work as a series of pull requests.

## Calendars [#](https://blogs.igalia.com/compilers/2026/01/31/implementing-the-temporal-proposal-in-javascriptcore/#calendars)

Representing dates with non-ISO8601 calendars is still very much a work in progress. The [ICU library](https://icu.unicode.org/) can already do the basic date computations, but much glue code is necessary to internally represent dates with non-ISO8601 calendars and call the correct ICU functions to do the computations. This work is still underway. The Temporal specification does not require support for non-ISO8601 calendars, but a separate proposal, [Intl Era Month Code](https://tc39.es/proposal-intl-era-monthcode/), proposes a set of calendars to be supported by conformant implementations.

## Testing Temporal [#](https://blogs.igalia.com/compilers/2026/01/31/implementing-the-temporal-proposal-in-javascriptcore/#testing-temporal)

The JavaScript test suite is called [test262](https://github.com/tc39/test262) and every new proposal in JavaScript must be accompanied by test262 tests. Not all JS implementations are required to support internationalization, so Temporal tests that involve non-ISO calendars or named time zones (other than the UTC time zone) are organized in a separate `intl402` subdirectory in test262.

The test262 suite includes 6,764 tests for Temporal, with 1,791 of these tests added in 2025. Igalia invested hundreds of hours on increasing test coverage over the past year.

## Status of work [#](https://blogs.igalia.com/compilers/2026/01/31/implementing-the-temporal-proposal-in-javascriptcore/#status-of-work)

All of this work is behind a flag in JSC in Technology Preview, so to try it out, you'll have to pass the `--useTemporal=1` flag.

All of the implementation work discussed above (except for non-ISO calendars) is complete, but I've been following an incremental approach to submitting the code for review by the JSC code owners. I've already landed about 40 pull requests over the course of 2025, and expect to be submitting at least 25 more to complete the work on `PlainYearMonth`, `ZonedDateTime`, and `relativeTo`.

Based on all the code that I've implemented, 100% of the non-intl402 test262 tests for Temporal pass, while the current HEAD version of JSC passes less than half the tests.

My colleagues at Igalia and I look forward to a future JavaScript standard that fully integrates Temporal, enabling JavaScript programs to handle dates more robustly and efficiently. Consistent implementation of the proposal across browsers is a key step towards this future. Step by step, we're getting closer to this goal.

- Previous: [Legacy RegExp features in JavaScript](https://blogs.igalia.com/compilers/2026/01/20/legacy-regexp-features-in-javascript/)