// Copyright 2017-2019 @polkadot/types authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// tslint:disable no-magic-numbers
import {HeaderValue} from '@plugnet/types/rpc/Header';
import {blake2AsU8a} from '@plugnet/util-crypto';
import Extrinsics from '../extrinsic/Extrinsics';
import {Hash, Header, Struct} from '../polkadot';
import {AnyU8a} from '../polkadot.types';

export type BlockValue = {
    extrinsics?: Array<AnyU8a>;
    header?: HeaderValue;
};

/**
 * @name Block
 * @description
 * A block encoded with header and extrinsics
 */
export default class Block extends Struct {
    constructor(value?: BlockValue | Uint8Array) {
        super(
            {
                header: Header,
                extrinsics: Extrinsics,
            },
            value
        );
    }

    /**
     * @description Encodes a content [[Hash]] for the block
     */
    get contentHash(): Hash {
        return new Hash(blake2AsU8a(this.toU8a(), 256));
    }

    /**
     * @description The [[Extrinsics]] contained in the block
     */
    get extrinsics(): Extrinsics {
        return this.get('extrinsics') as Extrinsics;
    }

    /**
     * @description Block/header [[Hash]]
     */
    get hash(): Hash {
        return this.header.hash;
    }

    /**
     * @description The [[Header]] of the block
     */
    get header(): Header {
        return this.get('header') as Header;
    }
}
