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

import {mergeDeriveOptions} from '@cennznet/api/util/derives';
import {CennzxSpot} from '@cennznet/crml-cennzx-spot';
import {GenericAsset} from '@cennznet/crml-generic-asset';
import Alias from '@cennznet/types/alias';
import {ApiPromise} from '@plugnet/api';
import {ApiOptions as ApiOptionsBase} from '@plugnet/api/types';
import {ProviderInterface} from '@plugnet/rpc-provider/types';
import {isFunction, isObject} from '@plugnet/util';

import * as derives from './derives';
import getPlugins from './plugins';
import staticMetadata from './staticMetadata';
import {ApiOptions, IPlugin} from './types';
import {getProvider} from './util/getProvider';
import {getTimeout} from './util/getTimeout';
import {injectOption, injectPlugins, mergePlugins} from './util/injectPlugin';
import logger from './util/logging';

const Types = require('@cennznet/types');

export const DEFAULT_TIMEOUT = 10000;

export class Api extends ApiPromise {
    static async create(options: ApiOptions | ProviderInterface = {}): Promise<Api> {
        const api = await new Api(options);
        return withTimeout(
            new Promise((resolve, reject) => {
                const rejectError = err => {
                    // Disconnect provider if API initialization fails
                    api.disconnect();
                    reject(new Error('Connection fail'));
                };

                api.isReady.then(res => {
                    //  Remove error listener if API initialization success.
                    (api as any)._eventemitter.removeListener('error', rejectError);
                    resolve(res);
                }, reject);

                api.once('error', rejectError);
            }),
            getTimeout(options)
        );
    }

    // TODO: add other crml namespaces
    /**
     * Generic Asset CRML extention
     */
    genericAsset?: GenericAsset;
    /**
     * Cennzx Spot CRML extention
     */
    cennzxSpot?: CennzxSpot;

    constructor(provider: ApiOptions | ProviderInterface = {}) {
        const options =
            isObject(provider) && isFunction((provider as ProviderInterface).send)
                ? ({provider} as ApiOptions)
                : ({...provider} as ApiOptions);

        if (typeof options.provider === 'string') {
            options.provider = getProvider(options.provider);
        }
        options.metadata = Object.assign(staticMetadata, options.metadata);
        let plugins: IPlugin[] = options.plugins || [];
        try {
            plugins = mergePlugins(plugins, getPlugins());
            injectOption(options, plugins);
        } catch (e) {
            logger.error('plugin loading failed');
        }

        options.types = {...Types, ...options.types, ...Alias};
        options.derives = mergeDeriveOptions(derives, options.derives);

        super(options as ApiOptionsBase);

        if (plugins) {
            injectPlugins(this, plugins);
        }
    }
}

function withTimeout(promise: Promise<any>, timeoutMs: number = DEFAULT_TIMEOUT): Promise<any> {
    if (timeoutMs === 0) {
        return promise;
    }

    return Promise.race([
        promise,
        new Promise((reslove, reject) => {
            setTimeout(() => {
                reject(new Error(`Timed out in ${timeoutMs} ms.`));
            }, timeoutMs);
        }),
    ]);
}
