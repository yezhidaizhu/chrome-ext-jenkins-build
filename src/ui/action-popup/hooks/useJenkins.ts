

export type JobItem = {
    name: string, url: string,
    color: string,
    inQueue: boolean;
    building: boolean;
    canBuild: boolean;
};


export function useJenkins() {
    const jkToken = useStorage('jkToken', '');
    const jkUser = useStorage('jkUser', 'admin');
    const jkHost = useStorage('jkHost', '');
    const getJobs = async (): Promise<JobItem[]> => {
        const host = toValue(jkHost);
        const user = toValue(jkUser);
        const token = toValue(jkToken);

        // 1. 获取 view 所有 Job
        const viewRes = await fetch(`${host}/view/All/api/json?tree=jobs[name,url,color]`, {
            headers: { Authorization: 'Basic ' + btoa(`${user}:${token}`) }
        });
        if (!viewRes.ok) throw new Error(`获取视图失败: ${viewRes.status}`);
        const viewJson = await viewRes.json();
        const jobs: any[] = viewJson.jobs || [];

        // 2. 获取队列
        const queueRes = await fetch(`${host}/queue/api/json`, {
            headers: { Authorization: 'Basic ' + btoa(`${user}:${token}`) }
        });
        if (!queueRes.ok) throw new Error(`获取队列失败: ${queueRes.status}`);
        const queueJson = await queueRes.json();
        const queueNames = queueJson.items.map((i: any) => i.task?.name);

        return jobs.map(job => {
            const building = /_anime$/.test(job.color);  // 构建中 :contentReference[oaicite:5]{index=5}
            const inQueue = queueNames.includes(job.name);
            const canBuild = !building && !inQueue;
            return {
                name: job.name,
                url: job.url,
                color: job.color,
                inQueue,
                building,
                canBuild
            };
        });
    }

    // 获取 Crumb
    async function getCrumb() {
        if (!toValue(jkHost) || !toValue(jkUser) || !toValue(jkToken)) throw new Error('Jenkins 配置信息不完整')
        const res = await fetch(`${toValue(jkHost)}/crumbIssuer/api/json`, {
            headers: {
                Authorization: 'Basic ' + btoa(`${toValue(jkUser)}:${toValue(jkToken)}`)
            }
        })
        if (!res.ok) throw new Error(`获取 crumb 失败: ${res.status}`)
        return res.json()
    }

    // 手动触发build
    async function triggerBuild(opts: { jobName: string }) {
        const { jobName } = opts
        const host = toValue(jkHost)
        const user = toValue(jkUser)
        const token = toValue(jkToken)

        try {
            // 获取 crumb
            const { crumb, crumbRequestField } = await getCrumb()

            // 判断 job 是否为参数化构建
            const jobInfoRes = await fetch(`${host}/job/${jobName}/api/json`, {
                headers: {
                    Authorization: 'Basic ' + btoa(`${user}:${token}`)
                }
            })

            if (!jobInfoRes.ok) {
                throw new Error(`获取 Job 信息失败: ${jobInfoRes.status}`)
            }

            const jobInfo = await jobInfoRes.json()
            const isParameterized = jobInfo.property?.some(
                (action: any) =>
                    action._class === 'hudson.model.ParametersDefinitionProperty'
            )

            // 构建请求路径
            const triggerUrl = isParameterized
                ? `${host}/job/${jobName}/buildWithParameters`
                : `${host}/job/${jobName}/build`

            const res = await fetch(triggerUrl, {
                method: 'POST',
                headers: {
                    Authorization: 'Basic ' + btoa(`${user}:${token}`),
                    [crumbRequestField]: crumb
                }
            })

            if (!res.ok) {
                throw new Error(`触发构建失败: ${res.status} ${res.statusText}`)
            }

            console.log(`✅ 构建已触发: ${jobName}`)
        } catch (e: any) {
            console.error('❌ 触发失败:', e.message)
        }
    }

    // 打断构建
    const stopBuild = async (opts: { jobName: string }) => {
        const { jobName } = opts;

        const host = toValue(jkHost)
        const user = toValue(jkUser)
        const token = toValue(jkToken)

        const { crumb, crumbRequestField } = await getCrumb()
        // 获取最新构建编号
        const numRes = await fetch(
            `${host}/job/${jobName}/lastBuild/buildNumber`,
            { headers: { Authorization: 'Basic ' + btoa(`${user}:${token}`) } }
        )
        if (!numRes.ok) throw new Error(`获取 buildNumber 失败: ${numRes.status}`)
        const buildNumber = (await numRes.text()).trim()

        // POST /stop 来中断构建
        const stopRes = await fetch(
            `${host}/job/${jobName}/${buildNumber}/stop`,
            {
                method: 'POST',
                headers: {
                    Authorization: 'Basic ' + btoa(`${user}:${token}`),
                    [crumbRequestField]: crumb
                }
            }
        )
        if (!stopRes.ok) throw new Error(`中断构建失败: ${stopRes.status}`)
    }

    return { jkHost, getJobs, triggerBuild, stopBuild }
}

/**
 * 根据Jenkins任务颜色判断是否可以打断构建
 * @param {string} color - Jenkins任务颜色状态
 * @returns {boolean} - 是否可以打断构建
 */
export function canAbortBuild(color = '') {
    // 有效的颜色状态列表（可以被打断的状态）
    const abortableStates = [
        'blue_anime',  // 正在构建（之前成功）
        'red_anime',   // 正在构建（之前失败）
        'yellow_anime', // 正在构建（之前不稳定）
        'aborted_anime' // 正在构建（之前被中止）
    ];

    // 检查颜色是否以"_anime"结尾（表示正在构建）
    const isBuilding = color && color.endsWith('_anime');

    // 或者检查是否在可打断状态列表中
    return isBuilding || abortableStates.includes(color);
}

/**
 * 仅根据Jenkins颜色判断是否可以触发构建
 * @param {string} color - Jenkins任务颜色
 * @returns {boolean} - true表示可以触发构建，false表示不可触发
 */
export function canTriggerBuild(color = '') {
    const normalizedColor = (color || '').toLowerCase();
    return !normalizedColor.endsWith('_anime') && normalizedColor !== 'disabled';
}
