import { describe, expect, it } from "vitest";
import { isPrivateIp } from "./security.js";

describe("security", () => {
  it("blocks loopback and private IPv4", () => {
    expect(isPrivateIp("127.0.0.1")).toBe(true);
    expect(isPrivateIp("192.168.1.1")).toBe(true);
    expect(isPrivateIp("8.8.8.8")).toBe(false);
  });
});
