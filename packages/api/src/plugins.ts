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

import {IPlugin} from '@cennznet/api/types';
import {Plugin as CrmlCennzx} from '@cennznet/crml-cennzx-spot';
import {Plugin as CrmlGenericAsset} from '@cennznet/crml-generic-asset';

export default function getPlugins(): IPlugin[] {
    return [(CrmlGenericAsset as unknown) as IPlugin, (CrmlCennzx as unknown) as IPlugin];
}
