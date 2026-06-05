export const buildColdEmailPrompt = (application) => {
  const { company, role, jobDescriptionText } = application;

  return `You are an expert job application coach helping a developer write a cold email to a recruiter.

Company: ${company}
Role: ${role}
${jobDescriptionText ? `Job Description: ${jobDescriptionText}` : ""}

Write a professional, concise cold email from the candidate to the recruiter at ${company}.
The email should:
- Have a subject line on the first line starting with "Subject:"
- Be 150-200 words maximum
- Sound human and genuine, not templated
- Highlight relevant full stack development skills
- End with a clear call to action
- Not use buzzwords like "passionate" or "leverage"

Write only the email, nothing else.`;
};

export const buildFollowUpPrompt = (application) => {
  const { company, role, appliedDate, interviews } = application;

  const lastInterview =
    interviews?.length > 0 ? interviews[interviews.length - 1] : null;

  return `You are an expert job application coach helping a developer write a follow-up email.

Company: ${company}
Role: ${role}
Applied Date: ${new Date(appliedDate).toDateString()}
${
  lastInterview
    ? `Last Interview Round: ${lastInterview.round} on ${new Date(lastInterview.date).toDateString()}`
    : "Status: Applied, no interview yet"
}

Write a professional follow-up email.
The email should:
- Have a subject line on the first line starting with "Subject:"
- Be 100-150 words maximum
- Be polite and not pushy
- Reference the specific role and company
- Ask for an update on the application status

Write only the email, nothing else.`;
};

export const buildInterviewQuestionsPrompt = (application) => {
  const { company, role, jobDescriptionText } = application;

  return `You are an expert technical interviewer helping a full stack developer prepare for an interview.

Company: ${company}
Role: ${role}
${jobDescriptionText ? `Job Description: ${jobDescriptionText}` : ""}

Generate 10 interview questions this candidate is likely to face.
Split them into these categories:
1. Technical Questions (5) - based on the role and job description
2. System Design (2) - architecture and design thinking
3. Behavioural Questions (3) - situation based

For each question also write a brief one-line tip on how to approach the answer.

Format the response exactly like this:

**Technical Questions**

**Q1.** [question]
**Tip:** [approach tip]

**Q2.** [question]
**Tip:** [approach tip]

**System Design**

**Q1.** [question]
**Tip:** [approach tip]

**Behavioural Questions**

**Q1.** [question]
**Tip:** [approach tip]

Use bold formatting for every category name, every question label like **Q1.**, and every **Tip:** label.
Leave one blank line between every question block.

Write only the questions, nothing else.`;
};

export const buildResumeFeedbackPrompt = (resumeText, jobDescription) => {
  return `You are an expert technical recruiter reviewing a developer's resume against a job description.

Resume:
${resumeText}

Job Description:
${jobDescription}

Provide structured feedback:
1. Match Score (out of 10) - how well resume matches JD
2. Strong Points (3 bullet points) - what stands out
3. Missing Skills - skills in JD not shown in resume
4. Suggested Improvements (3 bullet points) - specific resume changes
5. One Line Summary - overall assessment

Write the feedback directly to the candidate using "you" and "your".
Do not refer to the candidate by name.
Do not use third person words like "he", "she", "they", or the candidate's name.

Be honest and specific. No generic advice.`;
};

export const buildChatSystemPrompt = () => {
  return `You are a helpful job search assistant for a software developer.
You help with:
- Interview preparation and tips
- Resume and cover letter advice
- Salary negotiation strategies
- Job search strategies
- Career growth advice
- Technical interview questions

Be concise, practical, and encouraging.
Format responses with markdown when helpful.`;
};
