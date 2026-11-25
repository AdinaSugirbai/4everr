import type { ResumeRow } from "@/lib/userdata";

type Props = {
  resumes: ResumeRow[];
  value: string;
  onChange: (id: string) => void;
};

export default function ResumePicker({
  resumes,
  value,
  onChange,
}: Props) {
  if (resumes.length === 0) {
    return <p>Өтінім жібермес бұрын резюме жасаңыз.</p>;
  }

  return (
    <fieldset className="grid gap-2">
      <legend className="font-semibold">Қай резюмені жібересіз?</legend>

      {resumes.map((resume) => (
        <label
          key={resume.id}
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-3"
        >
          <input
            type="radio"
            name="resume"
            value={resume.id}
            checked={value === resume.id}
            onChange={() => onChange(resume.id)}
          />
          <span>
            <strong>{resume.title}</strong>
            {resume.is_primary && (
              <small className="ml-2 text-brand">Негізгі резюме</small>
            )}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
