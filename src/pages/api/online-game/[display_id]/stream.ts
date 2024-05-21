import type { APIRoute } from "astro";
import OnlineGameController from "../../../../scripts-server/onlineGameController";
import type { MoveStream } from "../../../../scripts-server/types";
import { queryDB } from "../../../../db/connect";

export const GET: APIRoute = async ({ request, params }) => {
  try {
    const displayId = params.display_id as string;
    await queryDB(`INSERT INTO test_time (test) VALUES ('get start')`);

    const sendEventObj: {
      current: (data: MoveStream) => void;
    } = {
      current: null as never,
    };

    const body = new ReadableStream({
      start(controller) {
        queryDB(`INSERT INTO test_time (test) VALUES ('start')`);
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
        queryDB(`INSERT INTO test_time (test) VALUES ('cancel')`);
        OnlineGameController.getInstance(displayId).unsubscribe(sendEventObj);
      },
    });

    await queryDB(`INSERT INTO test_time (test) VALUES ('before return')`);
    return new Response(body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
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
