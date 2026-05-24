import { selectCurrentUser } from '../../store/authSlice'
import { useAppSelector } from '../../store/hooks'

const metrics = [
  { label: 'Stock Items', value: '1,284', detail: 'Across active inventory' },
  { label: 'Pending Orders', value: '32', detail: 'For purchasing review' },
  { label: 'Receiving Today', value: '18', detail: 'Expected warehouse entries' },
  { label: 'Low Stock', value: '9', detail: 'Needs replenishment check' },
]

const activities = [
  'Purchase order PO-1028 is ready for approval.',
  'Warehouse A received 12 updated stock movements.',
  'Cycle count variance report is awaiting review.',
]

function getDisplayName(user) {
  if (!user) {
    return 'there'
  }
  return user.name || user.full_name || user.username || user.email || 'there'
}

function Dashboard() {
  return (
    <>
      Hello, {getDisplayName({name: 'John Doe'})}!
    </>
  )
}

export default Dashboard
