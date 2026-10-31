import type { Metadata } from "next";
import Link from "next/link";

import { PostFrame } from "@/components/blog/post-frame";
import { getPost } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

const post = getPost("how-to-follow-up-on-an-electrical-quote")!;

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
      lede="How to follow up on an electrical quote is mostly knowing when to stop. Three short texts, sent on a schedule, beat a week of “just checking in.” The scripts below are templates. Edit the job into them. They are not messages from a real customer."
      answer="Text the day you send the quote if you have not heard back. Text once the next day, with the one decision they still have to make. Text once more a few days later, and say you will leave it. Then leave it. Pushy is a fourth text that adds nothing."
      faq={[
        {
          question: "Should the follow-up be a call or a text?",
          answer:
            "Text first. They can read it on a job of their own. Call if they asked you to, or if the quote is large enough that a misunderstanding is expensive. Do not do both on the same hour.",
        },
        {
          question: "What if they opened the quote and still did not answer?",
          answer:
            "Treat that as interest with a stuck question, not as a no. The second script asks what the question is. If you cannot see opens, you are guessing, which is why the quote should be a link and not only a PDF.",
        },
        {
          question: "How many follow-ups is too many?",
          answer:
            "Three, unless they reply and start a real conversation. If there is no reply after the third, treat it as a no for now. More messages make it likelier they ignore you next time.",
        },
        {
          question: "Can I use these if I already talked to them in the driveway?",
          answer:
            "Yes. Change the first line so it sounds like you already know each other. Keep the question at the end. A follow-up without a question is easy to ignore.",
        },
      ]}
    >
      <h2>Why the fourth text feels desperate</h2>
      <p>
        The customer asked two or three electricians. Yours is one tab. A
        follow-up is useful when it answers the thing they are stuck on:
        what is included, how long the price holds, whether you can start on
        Thursday. It is noise when it only repeats that you exist.
      </p>
      <p>
        There is published research on how fast companies answer web leads,
        and it is not a study of electrical quotes. The useful part is in{" "}
        <Link
          href="/blog/how-fast-should-you-send-an-electrical-quote"
          className={link}
        >
          how fast should you send an electrical quote
        </Link>
        . Follow-up is what you do after the quote exists. It cannot repair a
        quote that went out three days late.
      </p>

      <h2>The schedule</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Same day, if they have not replied.</strong> One text. Assume
          they are busy, not rude.
        </li>
        <li>
          <strong>The next day.</strong> One question. Scope, start date, or
          the option they have not picked.
        </li>
        <li>
          <strong>A few days later.</strong> Close the loop. Tell them you
          will stop, and mean it.
        </li>
      </ul>
      <p>
        Skip a step if they already answered it. If they said &ldquo;I need to
        ask my partner,&rdquo; the next text is about that, on the day they
        named, not a generic nudge the next morning.
      </p>

      <h2>Script 1, the day you send it</h2>
      <p>
        Send this only if the quote has already gone out. A text with no
        document under it is a promise to send the document.
      </p>
      <blockquote className="border-l-2 border-brand pl-4 font-serif text-lg text-ink-90">
        Hi Sam, it&apos;s Alex at North Line Electric. The quote for the
        kitchen lights is in your texts, good through the 30th. The price
        includes the six openings, wiring, and the fixtures we looked at. It
        does not include patching the drywall. Reply if you want it booked.
      </blockquote>
      <p>
        Names, counts, and the exclusion are the whole text. &ldquo;Just
        checking you got it&rdquo; adds nothing they can answer.
      </p>

      <h2>Script 2, the next day</h2>
      <p>
        One decision. If the quote has options, ask which one. If it does not,
        ask the question they hesitated on in the driveway.
      </p>
      <blockquote className="border-l-2 border-brand pl-4 font-serif text-lg text-ink-90">
        Sam, quick one on the kitchen quote. The middle option is the same six
        lights with a dimmer and the better trim. I can hold Thursday if you
        pick today. If something on the page looks wrong, tell me which line.
      </blockquote>
      <p>
        &ldquo;Which line&rdquo; is an invitation to correct you. People answer
        that more often than they answer &ldquo;any update?&rdquo; If you did
        not offer options, delete the middle sentence. Do not invent a choice
        you did not price. How to build the three prices, when you want them,
        is{" "}
        <Link
          href="/blog/good-better-best-pricing-for-electricians"
          className={link}
        >
          good, better, best pricing for electricians
        </Link>
        .
      </p>

      <h2>Script 3, then stop</h2>
      <blockquote className="border-l-2 border-brand pl-4 font-serif text-lg text-ink-90">
        Sam, I&apos;ll leave the kitchen quote here. It stays good through the
        30th. After that I&apos;d reprice it, because the material can move.
        No need to reply if you&apos;ve gone another way. Happy to help if the
        job comes back.
      </blockquote>
      <p>
        This one does three things. It restates the expiry, so silence is not
        an argument later. It gives them a way to say no without a
        conversation. It leaves the door open without scheduling another ping.
        Put a reminder on your own calendar for the expiry if the job was
        large. Do not put a reminder to text them again.
      </p>

      <h2>What to cut</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Discounts that appear only in the follow-up. Price the job once.</li>
        <li>Guilt. They owe you a reply less than you think.</li>
        <li>A new scope you did not visit. That is a different quote.</li>
        <li>
          The same sentence three times. If the first text was clear, the
          second must add a fact.
        </li>
      </ul>
      <p>
        If you can see that they have not opened the quote, the first text is
        doing real work. If you can see that they opened it twice, script 2 is
        the one to send, and script 1 is already late. QuotePace shows opens
        and accepts on the quotes you send from it. The follow-up texts are
        still yours to write. Automatic chasing is switched on for businesses
        who ask for it. It is not a reason to send a worse message.
      </p>

      <h2>When they answer with someone else&apos;s price</h2>
      <p>
        A cheaper number is not an invitation to cut yours in the text thread.
        Ask what the other page includes. Half the time it is a different job:
        no permit, their fixture, a diagnostic billed later, drywall assumed.
        If you can see the other quote, compare lines. If you cannot, do not
        guess your way down to a total you did not build.
      </p>
      <p>
        Reply with the line they are missing, or with a smaller scope you are
        actually willing to do. A smaller scope is a new quote, not a discount
        code. &ldquo;I can do the six lights and leave the dimmer off&rdquo;
        is a choice. &ldquo;I can knock off a few hundred if you decide
        today&rdquo; tells them the first number was padded, and they will
        remember that the next time they call you.
      </p>
      <p>
        If their number is lower and the scope really is the same, you still
        do not have to match it. Say no in one sentence and leave script 3 in
        place. Taking work at a loss just to win it is how a week fills up
        with jobs you resent. The follow-up is there to clear up confusion,
        not to start a bidding war.
      </p>

      <h2>If they reply with a real question</h2>
      <p>
        Answer the question on the quote, then text the link. A long
        explanation that never updates the page leaves the old total as the
        thing they might accept. Change the line, note what changed, and send
        the new version. If the question is &ldquo;can you start
        Tuesday,&rdquo; answer Tuesday only if Tuesday is real. A yes you
        cannot keep will cost more than a slow follow-up.
      </p>
      <p>
        Stop the sequence once they are talking. The three scripts are for
        silence. Stacking a script on top of a conversation makes you look
        like you did not read their reply. Read it. Then write like a person
        who was just at their house, because you were.
      </p>

      <h2>Who the text is allowed to sound like</h2>
      <p>
        Write it the way you talk at the panel, not the way a marketing email
        talks. Use their name, the room, and one fact from the visit. If the
        text could be sent to any house on the street, it is too vague to
        deserve a reply. Drop the sign-off that lists your license, your
        years in business, and a row of services. They already have the quote.
        The text is a finger pointing at the one line they might be stuck on.
      </p>
      <p>
        Send it from the number they already have. A new thread from a
        different phone looks like spam and often gets ignored. If
        someone in the office sends it, the first line should still be the
        person who stood in the kitchen, because that is who they remember.
        Keep a copy. When they reply three weeks later, you want the expiry
        and the exclusion in the same thread as their yes, not reconstructed
        from memory.
      </p>
      <p>
        Feeling a bit awkward about the third text is normal. Send it anyway,
        because closing the loop is polite. Then stop, even if the job would
        have been a good week. A customer who hires you later will hire you
        because you were clear, not because you kept messaging.
      </p>

      <h2>Write the quote so the text can be short</h2>
      <p>
        A follow-up gets long when the quote was vague. If you are explaining
        the exclusions in the text, they were missing on the page. Fix the
        page. The difference between a quote they can accept and an estimate
        they can only ponder is{" "}
        <Link href="/blog/electrical-quote-vs-estimate-vs-bid" className={link}>
          electrical quote vs estimate vs bid
        </Link>
        . Get that right and these three texts stay under a few lines.
      </p>
    </PostFrame>
  );
}
