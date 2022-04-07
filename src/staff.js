import Axios from 'axios';
import HttpsProxyAgent from 'https-proxy-agent';

import C from '../lib/global/config.js';
import G from '../lib/global/log.js';


const proxy = C.proxy ? new HttpsProxyAgent(C.proxy) : null;


if(!C.release) { C.$.edit('release', () => ({})); }


const staff = async hey => {
	for(const repo in C.push.repo) {
		if(!C.release[repo]) { C.$.edit('release', packagesAll => (packagesAll[repo] = []) && void 0); }

		const channel = C.push.repo[repo];
		try {
			const url = `https://api.github.com/repos/${repo}/releases`;

			const { data: releases } = await Axios.get(url, { responseType: 'json', httpsAgent: proxy });

			const release = releases.find(rel => channel == 'pre' ? true : !rel.prerelease);
			const tag = release.tag_name ?? release.name;


			if(!C.release[repo].includes(release.tag_name)) {
				C.$.edit('release', packagesAll => packagesAll[repo].unshift(tag) && void 0);


				G.info('士大夫', `~[${repo}]`, `✔ 发现新~[发布]~{${tag}}`);


				hey({
					title: `${repo} 有新发布啦！`,
					body: release.name,
					data: `https://github.com/${repo}/releases/tag/${tag}`,
					tag: `${repo}`
				});
			}
			else {
				G.info('士大夫', `~[${repo}]`, `○ 暂无新~[发布]`);
			}
		}
		catch(error) {
			G.error('士大夫', `~[${repo}]`, `✖ ${error?.message ?? error}`);
		}
	}
};


export default staff;
