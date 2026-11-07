import { Suspense } from "react";
import ChatClient from "./ChatClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ChatClient />
    </Suspense>
  );
}
