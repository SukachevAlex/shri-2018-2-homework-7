interface Gesture {
    startX: number,
    startY: number,
    startLength: number,
    startAngle: number,
    prevX: string | null,
    prevY: string | null
  }
  
  let gesture: Gesture = {
      startX: 0,
      startY: 0,
      startLength: 0,
      startAngle: 0,
      prevX: '0',
      prevY: '0'
  };
  
  let events: Array<PointerEvent> = [];
  
  export function mouseDown(eventImage: HTMLElement, e: PointerEvent): void {
  
      events.push(e);
      gesture = {
          startX: e.x,
          startY: e.y,
          startLength: 1,
          startAngle: 0,
          prevX: e.target && (e.target as HTMLElement).style.backgroundPositionX,
          prevY: e.target && (e.target as HTMLElement).style.backgroundPositionY,
      };
  
      if (events.length === 2) {
          let dx= events[1].clientX - events[0].clientX;
          let dy = events[1].clientY - events[0].clientY;
  
          gesture.startAngle = getAngle(dx, dy);
          gesture.startLength = getLength(dx, dy);
      }
  
      eventImage.setPointerCapture(e.pointerId);
  }
  
  export function mouseMove(imageInfo: HTMLElement, e: PointerEvent): void {
      
  
    for (let i = 0; i < events.length; i++) {
        if (e.pointerId === events[i].pointerId) {
            events[i] = e;
        }
    }

    if ((e.target as HTMLElement).hasPointerCapture && (e.target as HTMLElement).hasPointerCapture(e.pointerId)) {
        const zoomField = imageInfo.querySelector('.zoom__value');
        const brightnessField = imageInfo.querySelector('.brightness__value');
        const fluency = 20;
        const limit= 5;

        if (events.length === 1) {
            const dx= e.x - gesture.startX;
            // const dy = e.y - gesture.startY;

            if (gesture.prevX) {
                (e.target as HTMLElement).style.backgroundPositionX = `${gesture.prevX + dx}px`;
            }
            // e.target.style.backgroundPositionY = `${gesture.prevY + dy}px`;
        } else if (events.length === 2) {
            const dx = events[1].clientX - events[0].clientX;
            const dy = events[1].clientY - events[0].clientY;

            if (Math.abs(gesture.startAngle - getAngle(dx, dy)) <= limit) {
                let length = getLength(dx, dy) - gesture.startLength;
                let zoomPrev = e.target && (e.target as HTMLElement).style.backgroundSize;
                let currZoom = zoomPrev && Math.min(400, Math.max(100, parseInt(zoomPrev + length / fluency)));
                (e.target as HTMLElement).style.backgroundSize = `${currZoom}%`;
                if(zoomField && currZoom) {
                    zoomField.textContent = `${currZoom - 100}%`;
                }
            } else {
                let angle = gesture.startAngle - getAngle(dx, dy);
                let brightPrev =  e.target && (e.target as HTMLElement).style.filter!.match(/\d+/)![0];
                let brightCurr = brightPrev && Math.min(100, Math.max(0, parseInt(brightPrev + angle / 20)));
                if (brightnessField) {
                    brightnessField.textContent = `${brightCurr}%`;
                }
                (e.target as HTMLElement).style.filter = `brightness(${brightCurr}%)`;
            }
        }
    }
}

  
  export function mouseUp(): void {
      events.pop();
  }
  
  function getLength(dx: number, dy: number): number {
      return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  }
  
  function getAngle(dx: number, dy: number): number {
      return Math.atan2(dx, dy) * 180 / Math.PI;
  }