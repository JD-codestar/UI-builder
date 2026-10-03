import { BoltStyleChat } from "@/components/ui/bolt-style-chat";

export default function DemoOne() {
  return (
    <BoltStyleChat 
      onSend={(msg) => console.log('Building:', msg)}
      onImport={(source) => console.log('Importing from:', source)}
    />
  );
}
