"use client";
import { useState } from "react";
import { toast } from "@/lib/fx";

export default function WithdrawButton() {
  const [ask, setAsk] = useState(false);
  const [done, setDone] = useState(false);
  if (done) return <span className="chip c-w">Өтінім қайтарылды</span>;
  if (!ask) return <button className="btn btn-s" onClick={() => setAsk(true)}>Өтінімді қайтарып алу</button>;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm">Растайсыз ба?</span>
      <button className="btn btn-p" onClick={() => { setDone(true); toast("Өтінім қайтарылды", "Жұмыс беруші енді оны көрмейді"); }}>Иә, қайтару</button>
      <button className="btn btn-s" onClick={() => setAsk(false)}>Жоқ</button>
    </div>
  );
}
