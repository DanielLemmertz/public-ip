import test from "node:test";import assert from "node:assert/strict";import {calculateCIDR} from "../src/cidr-core.js";
test("standard /24",()=>{const r=calculateCIDR("192.168.1.10/24");assert.equal(r.network,"192.168.1.0/24");assert.equal(r.mask,"255.255.255.0");assert.equal(r.broadcast,"192.168.1.255");assert.equal(r.usable,254)});
test("/0 full IPv4 space",()=>{const r=calculateCIDR("1.2.3.4/0");assert.equal(r.network,"0.0.0.0/0");assert.equal(r.broadcast,"255.255.255.255");assert.equal(r.total,4294967296)});
test("/31 point-to-point",()=>{const r=calculateCIDR("10.0.0.0/31");assert.equal(r.usable,2);assert.equal(r.first,"10.0.0.0");assert.equal(r.last,"10.0.0.1")});
test("/32 single host",()=>{const r=calculateCIDR("192.0.2.5/32");assert.equal(r.usable,1);assert.equal(r.network,"192.0.2.5/32")});
test("invalid IPv4 and prefixes rejected",()=>{for(const x of ["999.0.0.1/24","192.168.1.01/24","10.0.0.1/33","10.0.0.1"]){assert.throws(()=>calculateCIDR(x))}});