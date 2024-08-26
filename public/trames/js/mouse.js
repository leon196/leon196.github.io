
class Mouse
{
    constructor()
    {
        this.up = false;
        this.down = false;
        this.position = [0,0];
        this.previous = [0,0];
        this.elapsed = 0;
        this.delay = 0.1;
        this.moved = false;
    }

    init_events()
    {
        window.addEventListener("mousedown", (e) => {
            this.down = true;
        });

        window.addEventListener("mouseup", (e) => {
            this.up = true;
        });

        window.addEventListener("mousemove", (e) => {
            this.position = [e.clientX, e.clientY];
        });
    }

    activity(delta)
    {
        let update = false;

        // clic and stop moving
        if(this.down
        && this.moved
        && this.position[0] == this.previous[0]
        && this.position[1] == this.previous[1])
        {
            this.elapsed += delta;
        }
        else
        {
            this.elapsed = 0;
        }

        // moved
        if (this.position[0] != this.previous[0] || this.position[1] != this.previous[1])
        {
            this.moved = true;
        }

        this.previous[0] = this.position[0];
        this.previous[1] = this.position[1];

        // clic, stop moving and trigger delay threshold
        if (this.down && this.elapsed > this.delay && this.moved)
        {
            update = true;
            this.moved = false;
        }

        // update at release
        if (this.up)
        {
            update = true;
            this.up = false;
        }

        return update;
    }

    // mouse_move_on_preview(event)
    // {
    //     let mouse_x = event.offsetX;
    //     let mouse_y = event.offsetY;

    //     if (this.panzoom_image == undefined) return;

    //     let width = this.panzoom_image.width;
    //     let height = this.panzoom_image.height;

    //     this.views.zoom.zoom_x = mouse_x/width;
    //     this.views.zoom.zoom_y = 1-mouse_y/height;
        
    //     const zoom = 2;
    //     const w = this.global.definition_x * zoom;
    //     const h = this.global.definition_y * zoom;
    //     const x = -this.views.zoom.zoom_x * w + this.dom_zoom.clientWidth/2;
    //     const y = -this.views.zoom.zoom_y * h + this.dom_zoom.clientHeight/2;

    //     this.zoom = [x, y, w, h];
    // }
}