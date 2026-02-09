"use client";

import { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { ContactModal } from "@/components/ContactModal";
import { CsvImporter } from "@/components/CsvImporter";
import { Contact } from "@prisma/client";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedDate] = useState<Date>(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Fetch Contacts (including polling)
  const fetchContacts = useCallback(async () => {
    try {
      // Use local date string YYYY-MM-DD
      const dateStr = selectedDate.toLocaleDateString("en-CA");
      const res = await fetch(`/api/contacts?date=${dateStr}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setContacts(data);
      } else {
        console.error("API returned non-array:", data);
        setContacts([]);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchContacts();
    // Poll every 5 seconds to update status from Webhook
    const interval = setInterval(fetchContacts, 5000);
    return () => clearInterval(interval);
  }, [fetchContacts]); // Re-run when date changes

  // Handlers
  const handleCall = async (id: string) => {
    // Optimistic Update: Move to In Progress immediately
    setContacts(prev => prev.map(c => c.id === id ? { ...c, lastOutcome: "Calling..." } : c));

    try {
      const res = await fetch("/api/trigger-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: id })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger call");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Call Failed: ${message}`);
      // Revert optimistic update (simple fetch to reset)
      fetchContacts();
    }
  };

  const handleCreate = async (data: Partial<Contact>) => {
    if (!data.nextCallDate) data.nextCallDate = selectedDate;
    await fetch("/api/contacts", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data) 
    });
    setIsModalOpen(false);
    fetchContacts();
  };

  const handleUpdate = async (data: Partial<Contact>) => {
    if (!editingContact) return;
    await fetch(`/api/contacts/${editingContact.id}`, { 
      method: "PUT", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data) 
    });
    setIsModalOpen(false);
    setEditingContact(null);
    fetchContacts();
  };

  const handleReset = async (id: string) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, lastOutcome: "Failed" } : c));
    try {
      await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastOutcome: "Failed" })
      });
      fetchContacts();
    } catch (err) {
      console.error("Reset failed", err);
    }
  };

  return (
    <MainLayout rightPanel={<ActivityTimeline />}>
      <KanbanBoard
        contacts={contacts}
        onCall={handleCall}
        onEdit={(c) => { setEditingContact(c); setIsModalOpen(true); }}
        onReset={handleReset}
        onAdd={() => { setEditingContact(null); setIsModalOpen(true); }}
        onImport={() => setIsImportOpen(true)}
      />

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingContact(null); }}
        onSubmit={editingContact ? handleUpdate : handleCreate}
        initialData={editingContact}
        defaultDate={selectedDate}
      />

      {/* Temporary: Hidden Import Trigger for now, or add to Header later */}
      <CsvImporter
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportComplete={fetchContacts}
        defaultDate={selectedDate}
      />
    </MainLayout>
  );
}
