// Copyright 2019 Centrality Investments Limited
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { AccountId, U64 } from '@plugnet/types';
import { generateDoughnut, verifyDoughnut } from 'doughnut-maker';
import { u8aToHex } from '@plugnet/util';
import { Keypair } from '@plugnet/util-crypto/types';

const PAYLOAD_VERSION = 0;
const SIGNATURE_METHOD = 0;

/**
 * A v0 Doughnut certificate
 **/
export class Doughnut {

    constructor(
        readonly holder: AccountId,
        readonly issuer: AccountId,
        readonly expires: U64,
        readonly notBefore: U64,
        readonly permissions: Record<string, Uint8Array>,
        // Issuer key pair for signing the Doughnut
        private issuer_key: Keypair,
    ) { }

    /**
     * @description Sign and encoded the Doughnut as a v0 compliant Uint8Array.
     */
    sign(): Uint8Array {
        let doughnut = this;
        delete doughnut.issuer_key;

        return generateDoughnut(
            PAYLOAD_VERSION,
            SIGNATURE_METHOD,
            doughnut,
            this.issuer_key,
        )
    }

    /**
     * @description The length of the value when encoded as a Uint8Array
     */
    get isEmpty(): boolean {
        return this.encodedLength > 0
    }

    /**
     * @description Decode a Doughnut from a Uint8Array
     * @param doughnut A doughnut in v0 binary format, fails otherwise
     */
    decode(doughnut: Uint8Array): Doughnut | undefined {
        return verifyDoughnut(doughnut)
    }

    /**
     * @description The length of the value when encoded as a Uint8Array
     */
    get encodedLength(): number {
        return this.sign().length
    }

    /**
     * @description Returns a hex string representation of the value
     */
    toHex(): string {
        return u8aToHex(this.toU8a());
    }

    /**
     * @description Encodes the value as a Uint8Array as per the parity-codec specifications
     * @param isBare true when the value has none of the type-specific prefixes (internal)
     */
    toU8a(isBare?: boolean): Uint8Array {
        // Doughnut uses it's own binary codec. We need to hide this behind the parity codec interface
        // for it to integrate properly with the other extrinsic data/fields.
        return this.sign()
    }

    /**
     * @description Converts the Object to JSON, typically used for RPC transfers
     */
    toJSON(): any {
        return this.toHex();
    }

    /**
     * @description Returns the string representation of the value
     */
    toString(): string {
        // TODO: Maybe this wants the hex string...
        return JSON.stringify(this)
    }

    /**
     * @description Compares the value of the input to see if there is a match
     */
    eq(other?: any): boolean {
        return (
            this.issuer == other.issuer &&
            this.holder == other.holder &&
            this.permissions == other.permissions &&
            this.expires == other.expires &&
            this.notBefore == other.notBefore
        )
    }
}