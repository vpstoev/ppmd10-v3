import { useEffect } from 'react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { Avatar } from '../ui/Avatar'
import { people } from '../../data/people'
import { teams } from '../../data/teams'
import type { Person } from '../../data/types'
import styles from './PeopleSearch.module.css'

interface PeopleSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (person: Person) => void
}

/**
 * Department-wide people finder. A re-skinned shadcn Command (cmdk) inside a
 * shadcn Dialog — themed to A1/PPMD tokens via ui/shadcn-overrides.css. Scales
 * cleanly to 35–36 people: everyone is grouped by team and filtered as you
 * type, so the directory never has to render a wall of cards to be searchable.
 */
export function PeopleSearch({ open, onOpenChange, onSelect }: PeopleSearchProps) {
  // ⌘K / Ctrl+K opens the finder from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-lg"
      title="Search the department"
      description="Find anyone across PPMD by name or role."
    >
      <Command>
        <CommandInput placeholder="Search people by name or role…" />
        <CommandList>
          <CommandEmpty>No one matches that search.</CommandEmpty>
          {teams.map((t) => {
            const members = people.filter((p) => p.team === t.id)
            return (
              <CommandGroup key={t.id} heading={`${t.short} · ${members.length}`}>
                {members.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={`${p.name} ${p.role} ${t.short}`}
                    onSelect={() => {
                      onOpenChange(false)
                      onSelect(p)
                    }}
                  >
                    <Avatar person={p} size={28} />
                    <span className={styles.itemText}>
                      <span className={styles.itemName}>{p.name}</span>
                      <span className={styles.itemRole}>{p.role}</span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )
          })}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
