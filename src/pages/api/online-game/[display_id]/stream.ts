import type { APIRoute } from "astro";
import OnlineGameController from "../../../../scripts-server/onlineGameController";
import type { MoveStream } from "../../../../scripts-server/types";

export const GET: APIRoute = async ({ request, params }) => {
  try {
    const displayId = params.display_id as string;

    const sendEventObj: {
      current: (data: MoveStream) => void;
    } = {
      current: null as never,
    };

    const body = new ReadableStream({
      start(controller) {
        console.log("ERROR START");
        const encoder = new TextEncoder();

        sendEventObj.current = function (data: MoveStream) {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        OnlineGameController.getInstance(displayId).subscribe(sendEventObj);

        request.signal.addEventListener("abort", () => {
          OnlineGameController.getInstance(displayId).unsubscribe(sendEventObj);
          controller.close();
        });
      },
      cancel() {
        console.log("CANCEL");
        OnlineGameController.getInstance(displayId).unsubscribe(sendEventObj);
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/event-stream",
        // "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
      return new Response(null, { status: 500, statusText: error.message });
    }
    return new Response(null, { status: 500 });
  }
};
