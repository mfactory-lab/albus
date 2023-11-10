import type { PublicKey } from '@solana/web3.js'
import { COUNTRIES_LIST } from '../countries'
import { PolicyRule } from '../generated'

const EVENTS = {
  cacf: 'Crypto assets conference, Frankfurt',
  sb2023a: 'Solana breakpoint 2023, Amsterdam',
  ws2023l: 'Web summit 2023, Lisbon',
  cbbd: 'Chains beyond borders, Dubai',
}

const KEYS = {
  selectionMode: 'mode',
  countryLookup: 'country(ies)',
  expectedEvent: 'event',
  expectedDateFrom: 'date from',
  expectedDateTo: 'date to',
  expectedType: 'verifying issuer',
}

const LABELS = {
  selectionMode_true: 'includes',
  selectionMode_false: 'excludes',
  ...Object.keys(EVENTS).reduce((acc, cur) => ({ ...acc, [`expectedEvent_${cur}`]: EVENTS[cur] }), {}),
}

function formateDate(time: number, options?: { [key: string]: string }) {
  if (Number.isNaN(time)) {
    return '0'
  }
  const formatter = new Intl.DateTimeFormat('uk-Uk', options ?? {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })
  return formatter.format(time)
}

function secondsToMilliseconds(sec: number): number {
  return sec * 1000
}

function formatCamelCase(str: string) {
  return str.split(/(?=[A-Z])/).join(' ').toLowerCase()
}

function hasKey(rules: PolicyRule[], key: string) {
  return !!rules.find(r => r.key === key)
}

function getCircuitByRules(rules: PolicyRule[]) {
  if (
    hasKey(rules, 'minAge')
    && (
      rules.length === 1
      || (rules.length === 2 && hasKey(rules, 'maxAge'))
    )
  ) {
    return 'age'
  } else if (
    rules.length === 3
    && hasKey(rules, 'expectedEvent')
    && hasKey(rules, 'expectedDateFrom')
    && hasKey(rules, 'expectedDateTo')
  ) {
    return 'attendance'
  } else if (
    rules.length === 3
    && hasKey(rules, 'selectionMode')
    && hasKey(rules, 'countryLookup.0')
    && hasKey(rules, 'countryLookup.1')
  ) {
    return 'liveness'
  } else if (
    rules.length === 1
    && hasKey(rules, 'expectedType')
  ) {
    return 'country'
  }
  return ''
}

function normalizeRule({ key, label, value }: { key: string; label: string; value: number[] }): PolicyRuleNormalized {
  const keyFormatted = KEYS[key] ?? formatCamelCase(key)
  let valueFormatted = ''
  if (key === 'countryLookup') {
    valueFormatted = value
      .filter(v => v > 0)
      .reduce((acc, cur, idx) => `${acc}${idx > 0 ? ', ' : ''}${COUNTRIES_LIST[cur - 1]?.name}`, '')
  } else {
    valueFormatted = LABELS[`${key}_${label}`] ?? label
  }
  return {
    key: keyFormatted,
    value: valueFormatted,
  }
}

function groupRules(props: PolicyRule[]): PolicyRule[] {
  const list: Record<string, number[]> = {}
  props.forEach((r, idx) => {
    const name = r.key.split('.')[0] ?? ''
    if (!list[name]) {
      list[name] = []
    }
    list[name]?.push(idx)
  })
  const rules: PolicyRule[] = []
  for (const key in list) {
    rules.push({
      key,
      label: props[list[key]?.[0] ?? '']?.label,
      value: list[key]?.reduce((acc: number[], cur: number) => [...acc, ...(props[cur]?.value ?? [])], []) ?? [],
    })
  }
  return rules
}

export function normalizePolicyRules(props: PolicyRule[]): PolicyRuleNormalized[] {
  const groups = groupRules(props)
  return groups.map(g => normalizeRule(g))
}

export function formatPolicyRules(data: { circuit: PublicKey; rules: PolicyRule[] }): string {
  const rules = normalizePolicyRules(data.rules)
  switch (getCircuitByRules(data.rules)) {
    case 'age': {
      const to = rules[1]?.value !== '100' ? `to ${rules[1]?.value}` : ''
      return `Age: from ${data.rules[0]?.label} ${to}`
    }
    case 'attendance': {
      const expectedDateFrom = Number(rules[1]?.value)
      const expectedDateTo = Number(rules[2]?.value)

      let to = '∞'
      if (!Number.isNaN(expectedDateTo) && expectedDateTo !== 0) {
        to = String(formateDate(secondsToMilliseconds(expectedDateTo)))
      }
      const from = formateDate(secondsToMilliseconds(expectedDateFrom))
      const event = rules[0]?.value
      return `Event: ${event}, Date: ${from} - ${to}`
    }
    case 'liveness': {
      return `Verifying issuer: ${rules[0]?.value}`
    }
    case 'country': {
      return `Mode: ${rules[0]?.value}. Countries: ${rules[1]?.value}`
    }
    default:
      return ''
  }
}

export interface PolicyRuleNormalized {
  key: string
  value: string
}
