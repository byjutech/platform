import { test, expect, Page } from '@playwright/test'
import {
  checkIssueFromList,
  createIssue,
  createComponent,
  createSprint,
  DEFAULT_STATUSES,
  DEFAULT_USER,
  IssueProps,
  navigate,
  PRIORITIES,
  setViewGroup,
  setViewOrder,
  ViewletSelectors
} from './tracker.utils'
import { fillSearch, generateId, PlatformSetting } from './utils'
test.use({
  storageState: PlatformSetting
})

const getIssueName = (postfix: string = generateId(5)): string => `issue-${postfix}`

async function createIssues (
  prefix: string,
  page: Page,
  components?: string[],
  sprints?: string[]
): Promise<IssueProps[]> {
  const issuesProps = []
  for (let index = 0; index < 5; index++) {
    const shiftedIndex = 4 - index
    const name =
      sprints !== undefined
        ? getIssueName(`${prefix}-layout-${shiftedIndex}-${sprints[index % sprints.length]}`)
        : getIssueName(`${prefix}-layout-${shiftedIndex}`)
    const issueProps = {
      name,
      status: DEFAULT_STATUSES[shiftedIndex],
      assignee: shiftedIndex % 2 === 0 ? DEFAULT_USER : 'Chen Rosamund',
      priority: PRIORITIES[shiftedIndex],
      component: components !== undefined ? components[index % components.length] : undefined,
      sprint: sprints !== undefined ? sprints[index % sprints.length] : undefined
    }
    issuesProps.push(issueProps)

    await createIssue(page, issueProps)
  }

  return issuesProps
}

async function createComponents (page: Page): Promise<string[]> {
  const components = []

  for (let index = 0; index < 5; index++) {
    const prjId = `component-${generateId()}-${index}`
    components.push(prjId)

    await createComponent(page, prjId)
  }

  return components
}

async function createSprints (page: Page): Promise<string[]> {
  const sprints = []

  for (let index = 0; index < 5; index++) {
    const sprintId = `sprint-${generateId()}-${index}`
    sprints.push(sprintId)

    await createSprint(page, sprintId)
  }

  return sprints
}

async function initIssues (prefix: string, page: Page): Promise<IssueProps[]> {
  const components = await createComponents(page)
  const sprints = await createSprints(page)
  const issuesProps = await createIssues(prefix, page, components, sprints)
  await page.click('text="Issues"')

  return issuesProps
}

test.describe('tracker layout tests', () => {
  const id = generateId(4)
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000)
    await navigate(page)
    issuesProps = await initIssues(id, page)
  })

  let issuesProps: IssueProps[] = []
  const orders = ['Status', 'Modified', 'Priority'] as const
  const groups = ['Status', 'Assignee', 'Priority', 'Component', 'Sprint', 'No grouping'] as const
  const groupsLabels: { [key in (typeof groups)[number]]?: string[] } = {
    Status: DEFAULT_STATUSES,
    Assignee: [DEFAULT_USER, 'Chen Rosamund'],
    Priority: PRIORITIES,
    'No grouping': ['No grouping']
  }

  for (const group of groups) {
    test(`issues-${group.toLowerCase()}-grouping-layout`, async ({ page }) => {
      const locator = page.locator('.list-container')
      await setViewGroup(page, group)

      let groupLabels: any[]
      if (group === 'Sprint') {
        groupLabels = issuesProps.map((props) => props.sprint)
      } else {
        groupLabels = groupsLabels[group] ?? []
      }
      const issueNames = issuesProps.map((props) => props.name)

      await page.click(ViewletSelectors.Table)
      await expect(locator).toContainText(groupLabels)

      for (const issueName of issueNames) {
        await checkIssueFromList(page, issueName)
      }
    })
  }

  for (const order of orders) {
    test(`issues-${order.toLowerCase()}-ordering-layout`, async ({ page }) => {
      const locator = page.locator('.panel-container')
      let orderedIssueNames: string[]

      if (order === 'Priority') {
        orderedIssueNames = issuesProps
          .sort((propsLeft, propsRight) => {
            if (propsLeft.priority === undefined || propsRight.priority === undefined) {
              return -1
            }

            if (propsLeft.priority === propsRight.priority) {
              return 0
            } else if (
              PRIORITIES.findIndex((p) => p === propsLeft.priority) -
                PRIORITIES.findIndex((p) => p === propsRight.priority) >
              0
            ) {
              return 1
            }
            return -1
          })
          .map((p) => p.name)
      } else if (order === 'Status') {
        orderedIssueNames = issuesProps
          .sort((propsLeft, propsRight) => {
            if (propsLeft.status !== undefined && propsRight.status !== undefined) {
              if (propsLeft.status === propsRight.status) {
                return 0
              } else if (
                DEFAULT_STATUSES.findIndex((s) => s === propsLeft.status) -
                  DEFAULT_STATUSES.findIndex((s) => s === propsRight.status) >
                0
              ) {
                return 1
              }
            }

            return -1
          })
          .map((p) => p.name)
      } else {
        orderedIssueNames = issuesProps.map((props) => props.name).reverse()
      }
      await page.click(ViewletSelectors.Board)
      await setViewGroup(page, 'No grouping')
      await setViewOrder(page, order)

      await fillSearch(page, id)

      await expect(locator).toContainText(orderedIssueNames, {
        timeout: 15000
      })
    })
  }
})
