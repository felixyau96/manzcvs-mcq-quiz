# MANZCVS MCQ Quiz

Personal study quiz for MANZCVS Small Animal Medicine prep (weeks W01–W03, 30 MCQs each).

## Open the quiz

**Live (GitHub Pages):** https://felixyau96.github.io/manzcvs-mcq-quiz/

Or clone and serve locally:

```bash
cd manzcvs-mcq-quiz
python3 -m http.server 8080
```

Then open http://127.0.0.1:8080/

## Behaviour

- Pick W01 / W02 / W03
- Each attempt Fisher–Yates-shuffles **question order** and **option order**
- Instant feedback after every answer (graded in the browser)
- End screen: score + wrong question IDs
- History page with Asia/Hong_Kong timestamps; **Redo** anytime

## Scores & history

Attempts are saved in **this browser only** (`localStorage` key `manzcvs-quiz-attempts`).

- No cross-device sync
- No server-side webhook
- Clearing site data / using another browser starts with an empty history

## Layout

- `index.html` — week picker
- `quiz.html` — attempt UI
- `history.html` — past attempts
- `app.js` — shuffle, grade, localStorage
- `styles.css` — mobile-friendly dark UI
- `data/questions.json` — question bank (answers included; client-side grading)

## Privacy note

This is a personal exam-prep aid. Prefer a private repo when your GitHub plan allows Pages on private repositories; otherwise a clearly named public study repo is fine.
