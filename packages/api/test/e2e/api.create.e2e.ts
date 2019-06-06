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

import {Api} from '../../src/Api';
import staticMetadata from '../../src/staticMetadata';
import WsProvider from '@plugnet/rpc-provider/ws';
import {Metadata, Hash} from '@plugnet/types';

describe('e2e api create', () => {
    it.skip('For Kauri environment - checking if static metadata is same as latest', async () => {
        const endPoint = 'wss://kauri.centrality.cloud/ws?apikey=d449e2d0-868a-4f38-b977-b99e1476b7f0';
        const websocket = new WsProvider(endPoint);
        const api = await Api.create({provider: websocket, timeout: 10000});
        const meta = staticMetadata[`${api.genesisHash.toHex()}-${api.runtimeVersion.specVersion.toNumber()}`];
        expect(api.runtimeMetadata.toJSON()).toEqual(new Metadata(meta).toJSON());
        (websocket as any).websocket.onclose = null;
        (websocket as any).websocket.close();
    });

    it.skip('For Rimu environment - checking if static metadata is same as latest', async () => {
        const endPoint = 'wss://rimu.centrality.cloud/ws?apikey=d449e2d0-868a-4f38-b977-b99e1476b7f0';
        const websocket = new WsProvider(endPoint);
        const api = await Api.create({provider: websocket});
        const meta = staticMetadata[`${api.genesisHash.toHex()}-${api.runtimeVersion.specVersion.toNumber()}`];
        expect(api.runtimeMetadata.toJSON()).toEqual(new Metadata(meta).toJSON());
        (websocket as any).websocket.onclose = null;
        (websocket as any).websocket.close();
    });

    it('should create an Api instance with the timeout option', async () => {
        const endPoint = 'wss://rimu.centrality.cloud/ws?apikey=d449e2d0-868a-4f38-b977-b99e1476b7f0'
        const api = await Api.create({provider: endPoint, timeout: 10000000});
        const hash = await api.rpc.chain.getBlockHash() as Hash;

        expect(hash).toBeDefined();
    });

    it('create Api without timeout if timeout is 0', async () => {
        const endPoint = 'wss://rimu.centrality.cloud/ws?apikey=d449e2d0-868a-4f38-b977-b99e1476b7f0'
        const api = await Api.create({provider: endPoint, timeout: 0});
        const hash = await api.rpc.chain.getBlockHash() as Hash;

        expect(hash).toBeDefined();
    });

    it('should get rejected if the connection fails', async () => {
        const incorrectEndPoint = 'wss://rimu.centrality.cloud/'
        await expect(Api.create({provider: incorrectEndPoint})).rejects.toThrow();
    });

    it('should get rejected if it is not resolved in a specific period of time', async () => {
        const endPoint = 'wss://rimu.centrality.cloud/ws?apikey=d449e2d0-868a-4f38-b977-b99e1476b7f0'
        await expect(Api.create({provider: endPoint, timeout: -1})).rejects.toThrow();
    });
});
