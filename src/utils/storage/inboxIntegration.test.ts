import { beforeEach, describe, expect, it } from "bun:test";
import {
  getStoredInbox,
  ingestIntegrationSuggestions,
  markInboxSuggestionConverted,
  saveInbox,
} from "./inboxStorage";
import { buildDemoEcosystemSuggestions } from "../../../server/services/devEcosystemIngestor";

describe("inboxStorage integration helpers", () => {
  beforeEach(() => {
    saveInbox([]);
  });

  it("ingests suggestions cleanly and deduplicates repeated sourceRef entries", () => {
    const samples = buildDemoEcosystemSuggestions("all");
    const first = ingestIntegrationSuggestions(samples);
    expect(first.addedCount).toBe(2);
    expect(first.skippedCount).toBe(0);
    expect(getStoredInbox()).toHaveLength(2);

    const second = ingestIntegrationSuggestions(samples);
    expect(second.addedCount).toBe(0);
    expect(second.skippedCount).toBe(2);
    expect(getStoredInbox()).toHaveLength(2);
  });

  it("marks converted inbox suggestion with convertedLogId and read=true", () => {
    const [prItem] = buildDemoEcosystemSuggestions("github");
    ingestIntegrationSuggestions([prItem]);

    const updated = markInboxSuggestionConverted(prItem.id, "log-xyz-999");
    const target = updated.find((m) => m.id === prItem.id);
    expect(target?.convertedLogId).toBe("log-xyz-999");
    expect(target?.read).toBe(true);
  });
});
