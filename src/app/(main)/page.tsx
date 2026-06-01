import { redirect } from "next/navigation";

// Root (main) page — redirect to the resumes dashboard
export default function Home() {
  redirect("/resumes");
}
