import type { Metadata } from "next";
import Link from "next/link";

import { PostFrame } from "@/components/blog/post-frame";
import { getPost } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

const post = getPost("how-fast-should-you-send-an-electrical-quote")!;

export const metadata: Metadata = pageMetadata({
  title: `${post.title} — QuotePace`,
  description: post.description,
  path: `/blog/${post.slug}`,
  type: "article",
  publishedTime: post.publishedAt,
});

const link = "text-brand hover:underline";

export default function Post() {
  return (
    <PostFrame
      post={post}
      lede="How fast should you send an electrical quote? The same day you see the job, and from the driveway when the scope is clear. The research people quote about speed is real, and it is not a study of electricians. Here is what it measured, and what to do with it anyway."
      answer="Send it the day you price it. A 2011 Harvard Business Review piece on web leads found that firms which tried to respond within an hour were far more likely to qualify the lead than firms that waited. That study is not your trade. The part that transfers is simple: the customer asked more than one person, and the document that arrives while they are still deciding is the one they can say yes to."
      faq={[
        {
          question: "Does the famous five-minute rule apply to a panel quote?",
          answer:
            "Not as a law. The often-repeated five-minute figures come from call-center studies of web leads, not from residential electrical jobs. Use them as a warning against waiting until Thursday. Do not pretend a panel upgrade closes in five minutes.",
        },
        {
          question: "What if I cannot price it until I am back at the supply house?",
          answer:
            "Send what you know the same day, labelled as an estimate, and say when the quote will follow. Silence is the expensive option. A short page that names the missing price is still a response.",
        },
        {
          question: "Is a faster quote a worse quote?",
          answer:
            "Only if you skip the scope to hit the clock. Speed is the last step of a process you already know: scope, lines, exclusions, send. A pricebook is what makes the last step short.",
        },
        {
          question: "What do I do after I send it?",
          answer:
            "One follow-up if they go quiet, then another with a real question, then one that closes the loop. The scripts are in the follow-up post. More than that is nagging, and speed does not require nagging.",
        },
      ]}
    >
      <h2>What the study actually counted</h2>
      <p>
        In March 2011, Harvard Business Review published &ldquo;The Short Life
        of Online Sales Leads,&rdquo; by James B. Oldroyd, Kristina McElheran,
        and David Elkington. You can read the magazine&apos;s page here:{" "}
        <a
          href="https://hbr.org/2011/03/the-short-life-of-online-sales-leads"
          className={link}
        >
          The Short Life of Online Sales Leads
        </a>
        . It is about companies answering web inquiries, in industries like
        financial services, autos, education, and professional services. It is
        not about a homeowner comparing two electricians.
      </p>
      <p>
        The audit in that article covered 2,241 U.S. companies and a
        web-generated test lead. The authors reported that 37 percent
        responded within an hour, 16 percent responded within one to 24 hours,
        24 percent took more than 24 hours, and 23 percent never responded.
        Among companies that did respond within 30 days, the average response
        time was 42 hours.
      </p>
      <p>
        A separate study they describe used 1.25 million leads at 29
        business-to-consumer and 13 business-to-business companies. Firms that
        tried to contact the person within an hour were nearly seven times as
        likely to qualify the lead as firms that tried an hour later, and more
        than 60 times as likely as firms that waited 24 hours or longer. They
        defined qualify as a meaningful conversation with a decision maker.
        They did not claim those firms won the job. Contact is not a signed
        quote.
      </p>
      <p>
        So the honest use of the article is narrow. On web leads, in 2011, in
        other industries, waiting a day was common and it crushed the chance
        of a real conversation. Your customer is not a web lead in that
        dataset. Your customer did ask someone else. A quote that shows up
        after they have already booked the other truck is a quote that cannot
        be accepted, however careful the lines are.
      </p>

      <h2>What it does not say</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>It does not say the first electrician to text wins the panel.</li>
        <li>It does not say five minutes is a magic close rate. Treat viral &ldquo;100 times more likely&rdquo; claims as a different, older call study, and do not staple them onto this one.</li>
        <li>It does not say a sloppy number sent fast beats a clear number sent the same afternoon.</li>
        <li>It is fifteen years old. People still wait. That part has not become less embarrassing.</li>
      </ul>

      <h2>The standard that fits a van</h2>
      <p>
        If you can see the work, send the quote before you start the van, or
        before the next job starts. The scope is freshest in the driveway.
        The customer is freshest there too. A pricebook is what keeps that
        from being a rush job: the rows exist, you count, you add the
        exclusion you just saw, you send. Building that list is{" "}
        <Link href="/blog/how-to-build-an-electrical-pricebook" className={link}>
          how to build an electrical pricebook
        </Link>
        . Doing it on the phone is{" "}
        <Link
          href="/blog/how-to-write-an-electrical-quote-on-your-phone"
          className={link}
        >
          how to write an electrical quote on your phone
        </Link>
        .
      </p>
      <p>
        If you cannot see the work, do not invent a firm quote to win the
        clock. Send a short estimate the same day that says what you have not
        opened, and date the real quote. Same-day silence is the failure the
        study is about. A same-day estimate is a response. The words are
        sorted in{" "}
        <Link href="/blog/electrical-quote-vs-estimate-vs-bid" className={link}>
          electrical quote vs estimate vs bid
        </Link>
        .
      </p>

      <h2>A same-day bar you can actually hit</h2>
      <p>
        &ldquo;Within an hour&rdquo; is what the web-lead study measured. It is
        a poor slogan for a panel you have not opened. Translate it into a bar
        that survives contact with a house.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Seen it, and the scope is clear: the quote goes out before the next job, from the phone, with exclusions.</li>
        <li>Seen it, and one price is missing: the estimate goes out the same day, naming the missing price and the day the quote will follow.</li>
        <li>Not seen it: you do not send a firm quote to look fast. You send a time you will be there, or a budgetary note that says it is budgetary.</li>
        <li>They are comparing three of you: you still do not skip the exclusions to be first. First and vague loses to second and clear more often than the slogans admit, and no study cited here measured that.</li>
      </ul>
      <p>
        The usual problem is the quote you plan to &ldquo;write up
        tonight.&rdquo; Then dinner happens, tonight turns into tomorrow, and by
        then the other electrician has already replied. With a pricebook most
        of the writing is done ahead of time. On site you only add the counts
        and a sentence about what isn&apos;t included.
      </p>
      <p>
        Track it for a month without buying a new system, if you want proof in
        your own town. Write down the day they asked and the day you sent.
        You do not need a percentage from the internet to notice that the jobs
        you sent from the driveway get an answer, and the jobs you sent on
        Thursday get a polite nothing. If your own note says otherwise, trust
        your note over a 2011 magazine article. Use the article as a nudge to
        speed up, not as a target to hit.
      </p>

      <h2>Speed after the send</h2>
      <p>
        Once the quote is out, speed means noticing. If they open it and stall,
        one useful text beats three vague ones. If they never open it, the
        first text is the one that points at the link. Then you stop. The
        scripts and the point where you stop are in{" "}
        <Link
          href="/blog/how-to-follow-up-on-an-electrical-quote"
          className={link}
        >
          how to follow up on an electrical quote
        </Link>
        . Automatic reminders are a convenience. They are not a substitute for
        a quote that was late.
      </p>
      <p>
        QuotePace is built for sending the quote before you leave: your prices, a link, and
        a record of the open and the accept. The research above is not a
        promise that the link wins the job. The promise you can keep is that
        they had the number while they were still choosing.
      </p>

      <h2>What &ldquo;sent&rdquo; means</h2>
      <p>
        A quote is sent when the customer can open the price without calling
        you back. A text that says &ldquo;I&apos;ll get you a number&rdquo; is
        not sent. A photo of a notepad is not sent. A link, or a page they
        can read, is sent. If you use a tool that records the open, you also
        learn whether &ldquo;I never got it&rdquo; is true. That fact changes
        the follow-up. You resend once, you do not apologize for a document
        they already opened.
      </p>
      <p>
        Same day includes the evening of the visit if the driveway was
        impossible. It does not include &ldquo;this week.&rdquo; Put the send
        on the job notes the way you put the arrival. Shops that think they
        are fast are often fast to reply and slow to price. The study&apos;s
        useful split is exactly that: a response that starts the conversation,
        versus a day of nothing. Your version of the conversation is the
        number. Start it while the house is still in your head.
      </p>

      <h2>Sources</h2>
      <p>
        Oldroyd, McElheran, and Elkington, &ldquo;The Short Life of Online
        Sales Leads,&rdquo; Harvard Business Review, March 2011:{" "}
        <a
          href="https://hbr.org/2011/03/the-short-life-of-online-sales-leads"
          className={link}
        >
          hbr.org/2011/03/the-short-life-of-online-sales-leads
        </a>
        . Figures used here are the ones in that article: the 2,241-company
        audit, the response-time split, the 42-hour average, and the 1.25
        million lead comparison on qualifying a lead. Qualification is a
        conversation, not a closed sale, and the sample is not electrical
        contractors.
      </p>
    </PostFrame>
  );
}