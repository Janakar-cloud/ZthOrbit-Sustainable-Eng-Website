import { TimelineItemProps }  from '../type/type'


export default function TimelineItem({ title, text }: TimelineItemProps) {
  return (
    <div className="timeline-item">
      <div className="timeline-marker"></div>
      <div className="timeline-content">
        <h3 className="timeline-title">{title}</h3>
        <p className="timeline-text">{text}</p>
      </div>
    </div>
  )
}
